import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseService } from '../../services/course-service';
import { map } from 'rxjs';
import { AssignmentService } from '../../services/assignment-service';
import { ToastrService } from 'ngx-toastr';
import { Assignments } from '../../models/assignments';


@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './announcements.html',
  styleUrls: ['./announcements.css']
})
export class Announcements implements OnInit {
  private http = inject(HttpClient);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private courseService = inject(CourseService);
  private toastService = inject(ToastrService);

  notifications = signal<any[]>([]);
  instructorCourses = signal<{ id: string, title: string, category: string }[]>([]);
  
  announcementForm!: FormGroup; 
  private apiUrl = 'http://localhost:8000/api/announcements';
  isInstructor = false; 

  ngOnInit() {
    
    this.announcementForm = this.fb.group({
      courseId: ['', Validators.required],
      messageText: ['', [Validators.required, Validators.minLength(5)]]
    });

  
    this.courseService.instructorCourses$
      .pipe(
        map((courseArray) => {
          if (!courseArray) return [];
          return courseArray.map(c => ({ id: c._id ?? "", title: c.title, category: c.category }));
        })
      )
      .subscribe(courses => {
        if (courses) this.instructorCourses.set(courses);
      });

    
    this.userService.activeUser$.subscribe(user => {
      this.isInstructor = user?.role === "INSTRUCTOR";
      this.loadAnnouncements();
    });
  }

  getCourseName(id: string) {
    return this.instructorCourses().find(c => c.id == id)?.title || 'Selected Course';
  }

  /*loadAnnouncements() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => this.notifications.set(data),
      error: (err) => console.error('Could not load announcements', err)
    });
  }*/
 /*loadAnnouncements() {
  // Angular GET request hit karega backend standard endpoint par
  this.http.get<any>(this.apiUrl).subscribe({
    next: (response) => {
      // Kyunki backend AppResponse object bhejta hai, data nikalne ke liye response.data use hoga
      if (response && response.data) {
        this.notifications.set(response.data); 
      } else if (Array.isArray(response)) {
        this.notifications.set(response); // Fallback agar direct array aaye toh
      }
    },
    error: (err) => {
      console.error('Could not load announcements', err);
    }
  });
}*/
loadAnnouncements() {
  this.http.get<any>(this.apiUrl).subscribe({
    next: (response) => {
      console.log("Full Object Dump Bhai:", response);
      
      if (response && response.result && Array.isArray(response.result)) {
        console.log("Perfect!:", response.result);
        this.notifications.set(response.result); 
      } 
      
      else if (response && Array.isArray(response)) {
        this.notifications.set(response); 
      } 
      else {
        console.warn("format is not matching!");
      }
    },
    error: (err) => console.error('Could not load announcements', err)
  });
}

  postAnnouncement() {
    if (this.announcementForm.invalid) return;

    const payload = {
      message: this.announcementForm.value.messageText,
      course: this.announcementForm.value.courseId 
    };

    this.http.post(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.announcementForm.reset({ courseId: '', messageText: '' });
        this.loadAnnouncements(); 
        this.toastService.success("Announcement broadcasted successfully!");
      },
      error: (err) => {
        console.error('Failed to post announcement', err);
        this.toastService.error(err.error?.message || "Failed to post announcement");
      }
    });
  }
}