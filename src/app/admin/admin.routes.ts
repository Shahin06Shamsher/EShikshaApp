import { Routes } from "@angular/router";

export const adminRoutes : Routes = [
    {path:"", loadComponent:()=>import("./admin-page/admin-page").then(r=>r.AdminPage),children:[
        {path:"", redirectTo:"admin", pathMatch:'full'},
        {path:"admin",loadComponent:()=>import("./admindashboard/admindashboard").then(r=>r.Admindashboard)},
        {path:"manageusers", loadComponent:()=>import("./users/users").then(r=>r.Users)},
        {path:"settings", loadComponent:()=>import("../components/settings/settings").then(r=>r.Settings)},
        {path:"coursecatalog", loadComponent:()=>import("../components/course-catalog/course-catalog").then(r=>r.CourseCatalog)},
        {path:"coursecatalog/coursedetails/:courseId", loadComponent:()=>import("../components/course-details/course-details").then(r=>r.CourseDetails)}
    ]}
]