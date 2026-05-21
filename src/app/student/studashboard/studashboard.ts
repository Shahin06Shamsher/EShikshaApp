import { Component, computed, inject, signal } from '@angular/core';
import { DashboardServices } from '../../services/dashboard-services';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-studashboard',
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './studashboard.html',
  styleUrl: './studashboard.css',
})
export class Studashboard {
  studentCourses = signal([
  { 
    _id: 'c1', 
    title: 'Advanced Web Development', 
    isCompleted: true, 
    quizCount: 10,
    quizzesAttended: 10,
    // (Attended / Total) * 100
    progress: 100 
  },
  { 
    _id: 'c2', 
    title: 'Database Systems', 
    isCompleted: false, 
    quizCount: 8,
    quizzesAttended: 4,
    progress: 50 
  },
  { 
    _id: 'c3', 
    title: 'UI/UX Design', 
    isCompleted: false, 
    quizCount: 5,
    quizzesAttended: 1,
    progress: 20 
  }
]);

  // 2. Raw data from your Quiz History
  recentQuizzes = signal([
    { courseName: 'Web Development', score: 95, date: '2026-05-01' },
    { courseName: 'Web Development', score: 82, date: '2026-04-28' },
    { courseName: 'Database Design', score: 70, date: '2026-05-05' }
  ]);

  // 3. Computed stats (No complex DB queries needed!)
  enrolledCount = computed(() => this.studentCourses().length);
  completedCount = computed(() => this.studentCourses().filter(c => c.isCompleted).length);
  
  completionRate = computed(() => {
    return Math.round((this.completedCount() / this.enrolledCount()) * 100);
  });

  totalQuizzes = computed(() => this.recentQuizzes().length);
  averageQuizScore = computed(() => {
    const scores = this.recentQuizzes().map(q => q.score);
    return scores.length ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 0;
  });

  dasboardService = inject(DashboardServices);

  dashboardData = signal<any>('');

  ngOnInit(){
    this.dasboardService.getStudentDashboard().subscribe({
      next:res=>{
        this.dashboardData.set(res.result);
      },
      error:err=>{
        console.log(err);
      }
    })
  }

  getCourseCompletedCount(){
    let count = 0;
    this.dashboardData()?.enrolledCourses?.forEach((ec:any)=>{
      if(ec.totalAttended===ec.totalModule)count++;
    })
    return count;
  }

  getAverageQuizMarks(){
    let obtainMarks = 0;
    let totalMarks = 0;
    this.dashboardData()?.quizResult.forEach((q:any)=>{
      obtainMarks+=q.obtainMarks;
      totalMarks+=q.quiz.totalMarks;
    })
    return ((obtainMarks/totalMarks)*100).toFixed(2);
  }

  getEnrolledCourses(){
    return  this.dashboardData()?.enrolledCourses?.slice(0,3);
  }

  getCourseCompletionPercentage(course:any){
    if(course.totalModule==0)return 100;
    if(course.totalAttended===0) return 0;
    return ((course.totalAttended/course.totalModule)*100).toFixed(2);
  }

  getEnrolledDateStatus(date:Date){
    const enrolledDate = new Date(date);
    if(enrolledDate.getDate()===new Date(Date.now()).getDate()) return "today";
    return `${enrolledDate.getDate()} ${enrolledDate.toLocaleDateString('en-US', {month:'short'})}`
  }
}
