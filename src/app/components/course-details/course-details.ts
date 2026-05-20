import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { Assignments } from '../../models/assignments';
import { AsyncPipe, DatePipe } from '@angular/common';
import { AssignmentService } from '../../services/assignment-service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../services/user-service';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-course-details',
  imports: [DatePipe, AsyncPipe],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  activatedRoute = inject(ActivatedRoute);
  courseService = inject(CourseService);
  userService = inject(UserService);
  assignmentService=inject(AssignmentService);
  private toastService=inject(ToastrService);
  
  router = inject(Router);
  courseId1!: string;

  // enrolledAccessStatus = signal<'blocked'|'enrolled'|'notenrolled'>('blocked');
  enrolledCourseList = signal<[]>([]);

  selectedCourse = signal<{ course: Course, assignments: Assignments[], quizzes:any[] } | null>(null);

  ngOnInit() {
    this.courseId1 = this.activatedRoute.snapshot.params['courseId'];
    this.courseService.getCourseById(this.courseId1).subscribe(res => {
      this.selectedCourse.set(res.result);
      console.log(res.result);
    })
  }

  enroll() {
    this.courseService.enrollCourse(this.courseId1).subscribe({
      next:_=>{
        this.toastService.success(`Successfully enrolled in ${this.selectedCourse()?.course?.title}!`);
      },
      error:err=>{
        this.toastService.error(err.error.message??"Internal Server Error");
      }
    })
  }

  unrenroll(){
    
  }


  goToSubmitAssignment(assignment:Assignments) {
    this.assignmentService.selectedAssignment$.next(assignment);

    this.router.navigate(
      ['/dashboard/enrolledcourses/coursedetails', this.courseId1, 'assignment', assignment._id]
    );


  }

  startQuiz(quizId:string){
    if(confirm("Are you want to start this quiz?")){
      this.router.navigate(["/coursedetails", this.courseId1, 'quiz', quizId]);
    }
  }


   enrollmentAccessStatus(courseId?: string): Observable<'blocked' | 'enrolled' | 'notenrolled'> {
    return combineLatest([
      this.userService.activeUser$,
      this.courseService.studentCourses$
    ]).pipe(
      map(([user, enrolledCourses]) => {
        if(!user) return 'notenrolled'
        if (user?.role === 'ADMIN' || user?.role === 'INSTRUCTOR') {
          return 'blocked';
        }
        const hasCourse = enrolledCourses?.some(encourses => encourses.course._id === courseId);
        if (hasCourse) {
          return 'enrolled';
        }
        return 'notenrolled';
      })
    );
  }

}
