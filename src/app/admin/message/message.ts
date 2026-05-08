
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-communication',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message.html',
  styleUrls: ['./message.css']
})
export class CommunicationModuleComponent {
  activeTab: string = 'notifications'; // Change to 'messaging' or 'forum' to test
  isFormOpen: boolean = false;
  
  // Announcement Data
  notifications = [
    { title: 'New Assignment live!', body: 'The Angular Forms project has been uploaded.', time: '10 MINS AGO', type: 'info' },
    { title: 'Upcoming Live Session', body: 'Join us at 5:00 PM for a Q&A on RxJS.', time: '1 HOUR AGO', type: 'warning' },
    { title: 'Final Project Deadline', body: 'All submissions must be completed by May 27th.', time: '2 DAYS AGO', type: 'danger' }
  ];

  // AI Chat Data
  newMessage: string = '';
  isTyping: boolean = false;
  chats = [
    { sender: 'Bot', text: 'Hello Shahin! I can help you with your Angular training. What is your doubt?', time: '10:00 AM' }
  ];

  // Forum Data
  newTopicTitle: string = '';
  newTopicContent: string = '';
  forumPosts = [
    { author: 'Rahul S.', topic: 'RxJS error handling', replies: 2, date: 'Yesterday' },
    { author: 'Admin', topic: 'Welcome to the Batch!', replies: 15, date: '1 week ago' }
  ];

  // Functions
  sendMessage() {
    if (!this.newMessage.trim()) return;
    this.chats.push({
      sender: 'You',
      text: this.newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    const userQuery = this.newMessage;
    this.newMessage = '';
    this.isTyping = true;
    
    setTimeout(() => {
      this.isTyping = false;
      this.chats.push({
        sender: 'Bot',
        text: `I've noted your question about "${userQuery}". A mentor will respond shortly.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, 1500);
  }

  postToForum() {
    if (this.newTopicTitle.trim() && this.newTopicContent.trim()) {
      this.forumPosts.unshift({
        author: 'Shahin Shamsher',
        topic: this.newTopicTitle,
        replies: 0,
        date: 'Just now'
      });
      this.newTopicTitle = '';
      this.newTopicContent = '';
      this.isFormOpen = false;
    }
  }
}