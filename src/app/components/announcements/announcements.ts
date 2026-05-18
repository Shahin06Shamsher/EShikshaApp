import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcements.html',
  styleUrls: ['./announcements.css']
})
export class Announcements implements OnInit {
  private http = inject(HttpClient);

  notifications = signal<any[]>([]);
  private apiUrl = 'http://localhost:3000/api/announcements';

  newAnnouncementText = ''; 
  isInstructor = false; // Start as false to ensure student view by default

  ngOnInit() {
    this.loadAnnouncements();
    this.checkUserRole(); 
  }

  checkUserRole() {
    const data = localStorage.getItem('user'); 
    
    if (data) {
      const parsedData = JSON.parse(data);
      
      
      const userRole = parsedData.user?.role;

      // This toggles the view: 
      // If 'INSTRUCTOR', isInstructor becomes true (Show Post Box)
      // If 'STUDENT', isInstructor stays false (Hide Post Box)
      this.isInstructor = (userRole === 'INSTRUCTOR');
      
      console.log("Logged in role:", userRole);
      console.log("Access level - Is Instructor:", this.isInstructor);
    } else {
      this.isInstructor = false;
      console.log("No user data found in localStorage.");
    }
  }

  loadAnnouncements() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Could not load announcements', err)
    });
  }

  postAnnouncement() {
    if (!this.newAnnouncementText.trim()) return;

    const data = localStorage.getItem('user');
    const parsedData = data ? JSON.parse(data) : {};
    
    // Using the name from the nested user object
    const payload = {
      content: this.newAnnouncementText,
      instructorName: parsedData.user?.name || 'Instructor' 
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: () => {
        this.newAnnouncementText = ''; 
        this.loadAnnouncements(); 
      },
      error: (err) => console.error('Failed to post announcement', err)
    });
  }
}
