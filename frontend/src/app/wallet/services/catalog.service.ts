import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { StringLiteral } from '@taquito/michel-codec';
import { bytes2Char } from '@taquito/utils';
@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private url: string;
  private tokenAddress: string;
  private contractAddress: string;
  private tokenQuery: string;
  private contractQuery: string;

  constructor(
    private httpClient: HttpClient
  ) {
    this.tokenAddress = "KT1L6KVvTa3YqZRrkBXJdEzKCznU61wjwHSo";
    this.contractAddress = "KT1MY9NuNgjVW3ssUUFSgvsgH7LKLvppR6di";
    this.url = "https://api.ithacanet.tzkt.io/v1/contracts/";
    this.tokenQuery = "/bigmaps/token_metadata/keys";
    this.contractQuery = "/bigmaps/data/keys";
  }

  async fetchProjects() {
    return new Promise(async (resolve: any, reject: any) => {
      let urlQueryContract = this.url+this.contractAddress;
      let urlQueryToken = this.url+this.tokenAddress; 
      let urlContract = urlQueryContract+this.contractQuery;
      let queryContract = this.httpClient.get<any>(urlContract);
      let urlToken = urlQueryToken+this.tokenQuery;
      let queryToken = this.httpClient.get<any>(urlToken);

      let responseContract  = await queryContract.toPromise().then((response: any[]) => { return response});
      let responseToken  = await queryToken.toPromise().then((response: any[]) => { return response});


      let tokenData = [];
      for(let i = 0; i<responseContract.length; i++){
        const metadataToken = bytes2Char(responseToken[i].value.token_info[""]);
        const elements = metadataToken.split("//")
        const cid = elements[1];
        const httpUri = "https://ipfs.io/ipfs/"+cid;
        const metadataRequest = this.httpClient.get<any>(httpUri);
        const responseMetadata = await metadataRequest.toPromise().then((response: any) => {return response});
        const financialData = responseContract[i].value;
        const projectMetadata = responseMetadata;
        tokenData[i] = {
          ...financialData,
          ...projectMetadata,
          token_id: responseToken[i].value.token_id,
        };
      }
      resolve(tokenData);
    });
  }
}
