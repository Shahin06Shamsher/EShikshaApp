import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Course } from '../models/course';
import { BehaviorSubject, Observable } from 'rxjs';
import { Assignments } from '../models/assignments';
import { EnrolledCourse } from '../models/enrolledCourse';

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  httpClient = inject(HttpClient);
  apiServices = inject(ApiServices);

  instructorCourses$ = new BehaviorSubject<Course[]|null>(null);
  studentCourses$=new BehaviorSubject<EnrolledCourse[]|null>(null);

  catalogCourses$ = new BehaviorSubject<Course[]>([]);

  getAllCourses(title?:string,instructor?:string):Observable<{result:Course[],message:string}>{
    let params = new HttpParams();
    if(title && title.length>0){
      params = params.set("title",title);
    }
    if(instructor){
      params=params.set("instructor",instructor);
    }
    return this.httpClient.get<{result:Course[],message:string}>(this.apiServices.getFullUrl(this.getCourseEndpoint('')), {params});
  }

  getCourseById(courseId:string):Observable<{result:{course:Course,assignments:Assignments[], quizzes:any[]}, message:string}>{
    return this.httpClient.get<{result:{course:Course,assignments:Assignments[], quizzes:any[]}, message:string}>(this.apiServices.getFullUrl(this.getCourseEndpoint(`${courseId}`)))
  }

  createCourse(course:Course):Observable<{result:Course, message:string}>{
    return this.httpClient.post<{result:Course, message:string}>(this.apiServices.getFullUrl("instructor/course"),course);
  }
  updateCourse(courseId:string,updatedData:Course):Observable<{result:Course, message:string}>{
    return this.httpClient.patch<{result:Course, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}`),updatedData);
  }
  
  deleteCourse(courseId:string):Observable<{result:null; message: string }>{
    return this.httpClient.delete<{result:null ; message: string }>(this.apiServices.getFullUrl(`instructor/course/${courseId}`));
}
  

//ENROLLMENT============

  enrollCourse(courseId:string):Observable<{result:null, message:string}>{
    return this.httpClient.post<{result:null, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/enroll`),{});
  }

  getEnrolledCourse(studentId?:string):Observable<{result:EnrolledCourse[],message:string}>{
    return this.httpClient.get<{result:EnrolledCourse[],message:string}>(this.apiServices.getFullUrl(`student/course`));
  }

  //unEnrollCourse()
  getCourseEndpoint(endpoint:string):string{
    return `course/${endpoint}`;
  }



  isEnrolledCourse(courseId:string):boolean{
    console.log(courseId);
    // use firstValueFrom 
    this.studentCourses$.subscribe(res=>{
      if(res){
        return res.findIndex(c=>c.course._id===courseId)>-1?true:false;
      }
      return false;
    })
    return false;
  }
}
