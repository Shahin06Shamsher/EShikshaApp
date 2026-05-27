import { Component, inject, input} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user-service';
import { User } from '../../models/user';
import { LowerCasePipe } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { LoadingService } from '../../services/loading-service';
import { finalize } from 'rxjs';
import { TokenService } from '../../services/token-service';
import { CourseService } from '../../services/course-service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterModule,LowerCasePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {

  router = inject(Router);
  userService = inject(UserService);
  toastService=inject(ToastrService);
  loadingService=inject(LoadingService);
  tokenService = inject(TokenService);
  private courseService = inject(CourseService);

  navElements = input<string[]>();
  activeUser!:User;

  ngOnInit(){
    this.userService.activeUser$.subscribe(res=>{
      this.activeUser=res as User;
    })
  }

  getLink(navLink:string):string{
    if(navLink==="Dashboard" && this.activeUser?.role) return "./"+this.activeUser.role.toLocaleLowerCase();
    return navLink.replaceAll(" ","").toLowerCase();
  }

  logout(){
    this.loadingService.isLoading$.next(true);
    this.userService.logout().pipe(
      finalize(()=>this.loadingService.isLoading$.next(false))
    ).subscribe({
         next:(res)=>{
          this.tokenService.eshikshaToken = "";
          this.courseService.studentCourses$.next(null);
          this.router.navigateByUrl("");
          this.toastService.warning(res.message);
         },
         error:(err)=>{
          this.toastService.error("problem during logout")
         }
    }
    )
  }

}
