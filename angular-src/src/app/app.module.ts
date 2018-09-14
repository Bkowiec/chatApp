import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ChatRoomComponent } from './components/chat-room/chat-room.component';
import { MessageComponent } from './components/message/message.component';

import { FlashMessagesModule } from 'angular2-flash-messages';
import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { ActiveListComponent } from './components/active-list/active-list.component';


import { BlogComponent } from './components/blog/blog.component';
import { EditBlogComponent } from './components/blog/edit-blog/edit-blog.component';
import { DeleteBlogComponent } from './components/blog/delete-blog/delete-blog.component';
import { BlogService } from './services/blog.service';
import {ChatService} from './services/chat.service';
import { GameComponent } from './components/game/game.component';
import {GameScoreService} from './services/game.score.service';
import {Camera} from './game/camera';
import {ShapeDrawer} from './game/shape.drawer';
import { GameEndComponent } from './components/game-end/game-end.component';
import { GameMenuComponent } from './components/game-menu/game-menu.component';
import { GameScoreComponent } from './components/game-score/game-score.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'blog',
    component: BlogComponent,
    canActivate: [AuthGuard]
},
{
    path: 'edit-blog/:id',
    component: EditBlogComponent,
    canActivate: [AuthGuard]
},

{
  path: 'delete-blog/:id',
  component: DeleteBlogComponent,
  canActivate: [AuthGuard]
},
  {
    path: 'game',
    component: GameComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'game-score',
    component: GameScoreComponent,
    canActivate: [AuthGuard]
  },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'chat', canActivate: [AuthGuard], children: [
    { path: ':chatWith', component: ChatRoomComponent },
    { path: '**', redirectTo: '/chat/chat-room', pathMatch: 'full' }
  ] },
  { path: '**', redirectTo: '/', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    LoginComponent,
    RegisterComponent,
    HomeComponent,
    BlogComponent,
    EditBlogComponent,
    DeleteBlogComponent,
    ProfileComponent,
    ChatRoomComponent,
    MessageComponent,
    ActiveListComponent,
    GameComponent,
    GameEndComponent,
    GameMenuComponent,
    GameScoreComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    FlashMessagesModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    AuthGuard,
    AuthService,
    ChatService,
    BlogService,
    Camera,
    ShapeDrawer,
    GameScoreService
  ],
  bootstrap: [AppComponent]
})

export class AppModule { }
