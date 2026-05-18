import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // Fixes [ngClass] error
import { FormsModule } from '@angular/forms'; // Fixes [(ngModel)] error
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-community-forum',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './community-forum.html',
  styleUrls: ['./community-forum.css']
})
export class CommunityForumComponent implements OnInit {
  private http = inject(HttpClient);
  
  // Using signals to match your HTML's posts() call
  posts = signal<any[]>([]);
  isFormOpen = false;
  newPostTitle = '';
  newPostContent = '';

  ngOnInit() {
    this.loadPosts();
  }

  loadPosts() {
    this.http.get<any[]>('http://localhost:3000/api/forum').subscribe({
      next: (data) => this.posts.set(data),
      error: (err) => console.error("Server connection lost!", err)
    });
  }

  toggleForm() {
    this.isFormOpen = !this.isFormOpen;
  }

  submitPost() {
    if (!this.newPostTitle.trim() || !this.newPostContent.trim()) return;

    const newEntry = {
      title: this.newPostTitle,
      content: this.newPostContent,
      author: 'Shahin Shamsher',
      category: 'Technical' // Matches your 'bg-info' logic in HTML
    };

    this.http.post('http://localhost:3000/api/forum', newEntry).subscribe({
      next: () => {
        this.newPostTitle = '';
        this.newPostContent = '';
        this.isFormOpen = false;
        this.loadPosts();
      }
    });
  }

  // Fixes the "Property postReply does not exist" error
  postReply(postId: any, replyText: string) {
    if (!replyText.trim()) return;

    const replyData = {
      author: 'Shahin Shamsher',
      text: replyText
    };

    this.http.post(`http://localhost:3000/api/forum/${postId}/reply`, replyData).subscribe({
      next: () => this.loadPosts(),
      error: (err) => console.error("Reply failed", err)
    });
  }
}