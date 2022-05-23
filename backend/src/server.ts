import express from "express";
import pinataSDK from "@pinata/sdk";
import fs, { promises } from "fs";
import { TezosToolkit } from "@taquito/taquito";
import { bytes2Char, char2Bytes } from "@taquito/utils";
import { importKey } from '@taquito/signer';
import { MichelsonMap } from "@taquito/michelson-encoder";
import { JSONParseError } from "@taquito/michel-codec";
import { arrayBuffer } from "stream/consumers";
import * as nunjucks from 'nunjucks';
import * as pdf from 'html-pdf';

const PinataKeys = require("../PinataKeys");
const fileFormat = require("../utils/fileformat");
const cors = require("cors");
const multer = require("multer");
const ipfsHost = "https://ipfs.io/ipfs/";
const Tezos = new TezosToolkit("https://ithacanet.cryptostore.com.bo/");
let imgAddress: any = [];
const app = express();
const port = 8080;
const corsOptions = {
    origin: [
        "https://tzfunding.cryptostore.com.bo"
    ],
    optionSuccessStatus: 200
};
const upload = multer({ dest: "uploads/" });
const pinata = pinataSDK(PinataKeys.apiKey, PinataKeys.apiSecret); 

app.use(cors(corsOptions));
app.use(express.json({limit: "50mb"}));
app.use(
    express.urlencoded({
        limit: "50mb",
        extended: true,
        parameterLimit: 50000
    })
);

app.listen(port, () => {
    console.log(`server started at http://localhost:${port}`);
});

app.post("/deploy", upload.single("file"), async (req, res) => {
    const multerReq = req as any;
    let response: any;
    let data = {
        projectName: req.body.projectName,
        amount: req.body.amount,
        description: req.body.description,
        objectives: req.body.objectives,
        submissionDate: req.body.submissionDate,
        date: req.body.date,
        creator: req.body.creator
    };
    if (!multerReq.file) {
        res.status(500).json({ status: false, msg: "No file provided" });
    } else {
        const file = multerReq.file;
        const fileName = file.filename;
        await pinata
            .testAuthentication()
            .catch((err: any) => res.status(500).json(JSON.stringify(err)));
        let path = `./uploads/${fileName}`;
        if(file.mimetype == 'image/jpeg' || file.mimetype == 'image/png' || file.mimetype ==  'image/svg+xml' || file.mimetype ==  'image/webp'){
            let arr = new Array();
            let pdfProjectPath: string = await generateProjectPDF(path, data, file.mimetype);
            let pdfImages: any[] = await processPDF(pdfProjectPath);
            arr = await pinFilesToIpfs(path,pdfProjectPath,pdfImages, data)
            response = arr
        }else{
            res.status(500).json({ status: false, msg: "File format not supported"});
        }
        console.log(req.body);
        res.status(200).json({
            status: true,
            resources: JSON.stringify(response)
        });
    }
});

let generateProjectPDF = async (path: string, projectData: any, fileMimeType: string) => {
    return new Promise<string>((resolve: any, reject: any) => {
        const readableStreamForFile = fs.createReadStream(path,{encoding: 'base64'});
        readableStreamForFile.on('data', (data: string) =>{
            let base64String = "data:"+fileMimeType+";base64,"+data;
            const template = "./templates/project.html";
            const projectName = projectData.projectName.replace(/\s/g, "-");
            const pdfName = projectName+".pdf";
            const pathPdf = "./projects/"+pdfName;
            let options: any = {
                format: 'A4',
                orientation: 'portrait',
                border: {
                  top: "0.2in",
                  bottom: "0.2in",
                },
                paginationOffset: 1,
                footer: {
                  height: "10mm",
                  contents: {
                    default: 'Page: <pre style="color: #444;">{{page}}</pre>/<pre>{{pages}}</pre>'
                  }
                }
              }
            let html = nunjucks.render(template, {projectName: projectData.projectName, logo: base64String, description: projectData.description, objectives: projectData.objectives, publishDate: projectData.date, submissionDate: projectData.submissionDate});
            pdf.create(html, options).toFile(pathPdf, (err, res) => {
                if (err) reject(err);
                if(res)
                  resolve(res.filename);
            });
        });
    })
}

let processPDF = async (path: string) => {
    return new Promise<any[]>(async (resolve: any) => {
        fileFormat.PdfToImages(path,'./images/')
        .then(async (imagesArray: any) => {
            resolve(imagesArray);
        })
        .catch((err: any) =>{
            console.log(err);
        });
    });
}

let pinFilesToIpfs = async (logoPath: string,pdfProjectPath: string,pdfImages: any[],data: any) => {
    return new Promise<any[]>(async (resolve: any, reject: any) => {
        let filesIpfs: any = [];
        let logoIpfs: any = await uploadIpfs(logoPath,data,false);
        let pdfIpfs: any = await uploadIpfs(pdfProjectPath,data,false);
        data['logoCid'] = logoIpfs.fileHash;
        data['pdfCid'] = pdfIpfs.fileHash;
        let lenPdfImages = pdfImages.length;
        while (lenPdfImages > 0){
            let pdfImagePath: any = pdfImages.pop();
            let pdfImageIpfs: any = await uploadIpfs(pdfImagePath, data,true);
            let ipfsData = {
                file: pdfImageIpfs.fileHash,
                fileMetadata: pdfImageIpfs.metadataHash
            };
            filesIpfs.push(ipfsData);
            lenPdfImages = pdfImages.length;
        }
        resolve(filesIpfs);
    });
}

let uploadIpfs = async (image: any, data: any, isNft: boolean) => {
    return new Promise(async (resolve: any) => {
            try{
                    const readableStreamForFile = fs.createReadStream(image);
                    const options: any = {
                        pinataMetadata: {
                            name: data.projectName.replace(/\s/g, "-"),
                            keyvalues: {
                                description: data.description
                            }
                        }
                    };
                    const pinnedFile = await pinata.pinFileToIPFS(
                        readableStreamForFile,
                        options,
                    )
                    if (pinnedFile.IpfsHash && pinnedFile.PinSize > 0 ) {
                        let metadata: any = {
                            name: data.projectName,
                            description: data.description,
                            symbol: "TZS",
                            artifactUri: `ipfs://${pinnedFile.IpfsHash}`,
                            displayUri: `ipfs://${pinnedFile.IpfsHash}`,
                            creators: [data.creator],
                            decimals: 0,
                            thumbnailUri: `https://ipfs.io/ipfs/${pinnedFile.IpfsHash}`,
                            is_transferable: true,
                            shouldPreferSymbol: false
                        };
                        if(isNft){
                           metadata['projectLogo'] = "ipfs://"+data.logoCid;
                           metadata['projectPdf'] = "ipfs://"+data.pdfCid;
                        }

                        const pinnedMetadata = await pinata.pinJSONToIPFS(metadata, {
                            pinataMetadata: {
                                name: "TZS-metadata"
                            }
                        });

                        if (pinnedMetadata.IpfsHash && pinnedMetadata.PinSize > 0) {
                            let ipfsUrl = ipfsHost + pinnedFile.IpfsHash;
                            let owner = data.creator;
                            let pinned = {
                                fileHash: pinnedFile.IpfsHash,
                                metadataHash: pinnedMetadata.IpfsHash 
                            }
                            resolve(pinned);
                        }
                    }
                } catch(err) {
                    console.log(err);
                }
    });
}
