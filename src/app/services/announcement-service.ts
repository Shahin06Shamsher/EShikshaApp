import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  httpClient = inject(HttpClient);
  apiService = inject(ApiServices);

  loadAnnouncements(){
    return this.httpClient.get(this.apiService.getFullUrl('api/announcements'));
  }

}
