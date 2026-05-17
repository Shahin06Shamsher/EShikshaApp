import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ApiServices } from './api-services';
import { Course } from '../models/course';
import { BehaviorSubject, Observable } from 'rxjs';
import { Assignments } from '../models/assignments';

@Injectable({
  providedIn: 'root',
})
export class CourseService {

  httpClient = inject(HttpClient);
  apiServices = inject(ApiServices);

  instructorCourses$ = new BehaviorSubject<Course[]|null>(null);
  studentCourses$=new BehaviorSubject<Course[]|null>(null);

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
  updateCourse(courseId:string,updatedData:{courseName?:string,coursecategory?:string, courseDescription?:string, image?:string}):Observable<{result:{course:Course}, message:string}>{
    return this.httpClient.patch<{result:{course:Course}, message:string}>(this.apiServices.getFullUrl(`instructor/course/${courseId}`),updatedData);
  }
  
  deleteCourse(courseId:string):Observable<{result: { course: Course }; message: string }>{
    return this.httpClient.delete<{result:{ course: Course }; message: string }>(this.apiServices.getFullUrl(`instructor/course/${courseId}`));
}
  

//ENROLLMENT============

  enrollCourse(courseId:string):Observable<{result:{course:Course}, message:string}>{
    return this.httpClient.post<{result:{course:Course}, message:string}>(this.apiServices.getFullUrl(`student/course/${courseId}/enroll`),
     {}, // body (empty object if no payload)
    { responseType: 'json' } // ensure JSON response

  );
  }

  getEnrolledCourse(studentId?:string):Observable<{result:Course[],message:string}>{
    let params = new HttpParams();
    if(studentId){
      params=params.set("student",studentId);
    }
    return this.httpClient.get<{result:Course[],message:string}>(this.apiServices.getFullUrl(`student/course/${studentId}/enroll`));
  }

  //unEnrollCourse()
  getCourseEndpoint(endpoint:string):string{
    return `course/${endpoint}`;
  }

}
