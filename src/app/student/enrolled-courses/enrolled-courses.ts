import { Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CourseService } from '../../services/course-service';
import { Observable } from 'rxjs';
import { Course } from '../../models/course';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-enrolled-courses',
  imports: [RouterModule,CommonModule],
  templateUrl: './enrolled-courses.html',
  styleUrl: './enrolled-courses.css',
})
export class EnrolledCourses {
    userService=inject(UserService);
    courseService=inject(CourseService);
    courseList = signal<Course[]>([]);
    toastService=inject(ToastrService);

  ngOnInit(): void {
        this.courseService.instructorCourses$.subscribe(res=>{
      if(!res){
        this.userService.activeUser$.subscribe(user=>{
          this.courseService.getEnrolledCourse(user?._id).subscribe({
            next:courseResult=>{
              this.courseService.instructorCourses$.next(courseResult.result);
              this.courseList.set(courseResult.result)
              console.log(this.courseList());
            },
            error:err=>{
              this.toastService.error(err.error.message??"Internal Server Error");
            }
          })
        })
      }else{
        this.courseList.set(res);
      }
    })  
}
}

