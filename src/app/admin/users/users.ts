import { Component, inject, signal } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user-service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { combineLatest, debounceTime, distinctUntilChanged, map, skip, skipLast, startWith, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-users',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users {

  private userService = inject(UserService);
  private toastService = inject(ToastrService);
  private formBuilder = inject(FormBuilder);

  users = signal<{users:User[], totalUsers:number}>({users:[], totalUsers:0});
  selectedRole!:string;
  searchText = new FormControl('');
  setEditUser = signal<string>('');
  updatedRole = new FormControl('');
  currentPage = signal<number>(1);
  openInputRow = signal<boolean>(false);
  instructorData = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.pattern("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")]]
  })

  getUser$ = combineLatest([
      toObservable(this.currentPage),
      this.searchText.valueChanges.pipe(
        debounceTime(500),
        distinctUntilChanged(),
        startWith(this.searchText.value || '')
      )
    ]).pipe(
      switchMap(([page, value])=>{
        return this.userService.getUsers(this.selectedRole||'ALL', value??'', page)
      })
    )

  ngOnInit(){
    this.getUser$.subscribe({
      next:res=>{
        this.users.set(res.result);
      },
      error:err=>{
        this.toastService.error(err.error?.message??"Internal server Error");
      }
    })
  }

  filterUser(){
    this.getTableData(this.selectedRole, this.searchText.value??'');
  }

  getTableData = (role:string,searchVal?:string)=>{
    this.userService.getUsers(role,searchVal).subscribe(res=>{
      this.users.set(res.result)
    });
  }

  getAvtarUrl(name:string, role:string):string{
    const formattedName = name.split(" ").join("+");
    return `https://ui-avatars.com/api/?name=${formattedName}&${role==="STUDENT"?"background=E6FAFF&color=0DCAF0":"background=E8F1FF&color=0D6EFD"}`;
  }

  editUser(user:User, ind:number){
    if(user._id && this.setEditUser()===user._id){
      if(!this.updatedRole.touched){
        this.setEditUser.set('');
        return;
      }
      this.userService.updateUser(user._id, this.updatedRole.value??'').subscribe({
        next:res=>{
          this.updateUserTableData(user, 'update', ind);
          this.toastService.success(res.message);
        },
        error:err=>{
          console.log(err);
          this.toastService.error(err.error?.message??"Internal server Error");
        }
      })
    }else{
      this.updatedRole.setValue(user?.role??'');
      this.setEditUser.set(user._id??"");
    }
  }

  deleteUser(user:User){
    if(user._id){
      this.userService.deleteUser(user._id).subscribe({
        next:res=>{
          this.updateUserTableData(user, 'delete');
          this.toastService.success(res.message);
        },
        error:err=>{
          console.log(err);
          this.toastService.error(err.error?.message??"Internal server Error");
        }
      })
    }
  }

  updateUserTableData = (user:User, action:'update'|'delete', ind?:number)=>{
    if(action==='delete'){
      this.users.set({users:this.users().users.filter(u=>u._id!==user._id), totalUsers:this.users().totalUsers-1});
    }else if(action==='update' && ind){
      const updatedUser = {...user, role:this.updatedRole.value??user.role};
      this.users.update(usersData=>{
        return {
          ...usersData,
          users: usersData.users.map(u=>{
            if(u._id===user._id)return updatedUser;
            return u;
          })
        }
      });
    }
  }

  goToPreviousPage(){
    if(this.currentPage()>1){
      this.currentPage.update(pageNumber=>--pageNumber);
    }
  }

  goToNextPage(){
    if(this.currentPage()<(this.users().totalUsers/5)){
      this.currentPage.update(pageNumber=>++pageNumber);
    }
  }

  toggoleInputRow(){
    this.openInputRow.update(pre=>!pre);
  }

  createInstructor(){
    const {name, email} = this.instructorData.value;
    if(name && email){
      this.userService.addInstructor({name, email}).subscribe({
        next:res=>{
          this.users.update(uarr=>{
            uarr.users = [res.result, ...uarr.users];
            return uarr;
          })
          this.openInputRow.set(false);
          this.toastService.success(res.message);
        },
        error:err=>{
          this.toastService.error(err?.error?.message || "Internal server error");
        }
      })
    }
  }

  get email(){
    return this.instructorData.get('email');
  }
}
