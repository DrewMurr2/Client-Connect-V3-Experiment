import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { GeneralService } from './general.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { WebsocketService } from './websocket.service';
import { environment } from "../../../environments/environment";

@Injectable()
export class ApiService {
    constructor(
        private http: HttpClient,
        private wsService: WebsocketService,
        private generalService: GeneralService
    ) { }

    getHttpOptions(type = 'json') {
        return {
            headers: new HttpHeaders({
                'Content-Type': type != 'json' ? 'application/x-www-form-urlencoded' : 'application/json'
            })
        }
    }
    userService: UserService
    SERVER_URL = environment.SERVER_URL || 'http://localhost:3100'


    apis: {
        folderOne: {
            fileOne: 
    }
    }




    call(url, body: any = {}, contentType = null): Observable<any> {
        console.log('API SERVICE:', url)
        if (this.userService && this.userService.user && this.userService.user.token) body.token = this.userService.user.token
        if (contentType != 'json') {
            body = this.encodeQueryData(body);
        }


        const ob = this.http.post(this.SERVER_URL + url, body, this.getHttpOptions(contentType)).share();
        ob.subscribe((response: any) => {

        }, (error2) => {
            var errMessage = error2.error && error2.error.error ?
                error2.error.error : error2.error ? error2.error : error2
            try {
                this.generalService.showNotification(JSON.stringify(errMessage), 'Close');

            } catch (e) {
                console.log(error2);
            }

        });

        return ob
    }


    encodeQueryData(data) {

        const ret = [];
        for (const d in data) {
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        }

        return ret.join('&');

    }

    makeFileRequest(url, dataArr, files) {
        return new Promise((resolve, reject) => {
            let formData: any = new FormData();
            let xhr = new XMLHttpRequest();
            let token = {
                token: this.userService.user.token
            };

            files.forEach((fileObj, index) => {
                formData.append(fileObj.id, fileObj.file, fileObj.file.name);
            });

            dataArr.forEach((data, index) => {
                formData.append(data.name, data.value);
            });


            xhr.onreadystatechange = () => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        resolve(JSON.parse(xhr.response));
                    } else {
                        reject(xhr.response);
                    }
                }
            };
            xhr.open('POST', this.SERVER_URL + url, true);
            xhr.setRequestHeader('x-access-token', this.userService.user.token);
            xhr.send(formData);
        });
    }

}
