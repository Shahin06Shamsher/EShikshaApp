import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { Assignments } from '../../models/assignments';
import { DatePipe } from '@angular/common';
import { AssignmentService } from '../../services/assignment-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-course-details',
  imports: [DatePipe],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails {
  activatedRoute = inject(ActivatedRoute);
  courseService = inject(CourseService);
  assignmentService=inject(AssignmentService);
  private toastService=inject(ToastrService);
  
  router = inject(Router);
  courseId1!: string;

  isEnrolled:boolean=false;
  enrolledCourseList = signal<[]>([]);

  selectedCourse = signal<{ course: Course, assignments: Assignments[], quizzes:any[] } | null>(null);

  ngOnInit() {
    this.courseId1 = this.activatedRoute.snapshot.params['courseId'];
    this.courseService.getCourseById(this.courseId1).subscribe(res => {
      this.selectedCourse.set(res.result);
      console.log(res.result);
    })
  }

  hasAccess = (): boolean => {
    return localStorage.getItem("eshikshaToken") ? true : false;
  }

  // selectedCourse = signal(this.MOCK_SELECTED_COURSE);
  enroll() {
    this.courseService.enrollCourse(this.courseId1).subscribe({
      next:res=>{
        console.log(res);
        this.isEnrolled=true;
        const courses=this.enrolledCourseList ();
        // courses.push(res.result.course);
        this.enrolledCourseList.set(courses);
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
      ['/dashboard/coursecatalog/coursedetails', this.courseId1, 'assignment', assignment._id]
    );


  }

  startQuiz(quizId:string){
    console.log(quizId);
    if(confirm("Are you want to start this quiz?")){
      this.router.navigate(["/coursedetails", this.courseId1, 'quiz', quizId]);
    }
  }

}
