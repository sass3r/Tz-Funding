import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnySchema } from 'ajv';

@Injectable({
  providedIn: 'root'
})
export class MintService {
  private resource: string;
  private url: string;
  private token: string;

  constructor(
    private httpClient: HttpClient,
  ) {
      this.resource = '/deploy';
      this.url = 'http://localhost:8080';
      this.token = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  }

  async mintProject(formData: any) {
    let url = this.url + this.resource;
    let httpOptions = {};
    console.log("Sending project");
    console.log(formData);
    return await this.httpClient.post<any>(url,formData,httpOptions);
  }
}
