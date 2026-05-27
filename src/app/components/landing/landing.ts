import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CourseCard } from '../course-card/course-card';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../services/course-service';
import { Course } from '../../models/course';
import { debounceTime, distinctUntilChanged, finalize, switchMap } from 'rxjs';
import { LoadingService } from '../../services/loading-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-landing',
  imports: [ReactiveFormsModule, RouterModule, CourseCard, CommonModule],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing {

  courseServices = inject(CourseService);
  loadingService = inject(LoadingService);
  toastService = inject(ToastrService);

  searchCourse = new FormControl('');
  //courses came from api
  courses = signal<Course[]|null>(null);


  ngOnInit(){
    this.loadingService.isLoading$.next(true);
    
    this.courseServices.getAllCourses()
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe(res=>{
      this.courses.set(res.result.courses);
    })
    
    this.searchCourse.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((res)=>this.courseServices.getAllCourses(1,res??''))
    )
    .pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    )
    .subscribe({
      next:response=>{
        this.courses.set(response.result.courses);
      },
      error:err=>{
        this.toastService.error(err?.error?.message??"Error while searching course");
      }
    })
  }
  
  // Partnars came form api
  partnars = ["Google", "Amazon", "Flipkart"];

}
