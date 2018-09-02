import { Component, OnInit, Input } from '@angular/core';
import * as moment from 'moment';
import { AuthService } from "../../services/auth.service";
import { ChatService } from "../../services/chat.service";
import { Message } from "../../models/message.model";

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.scss']
})

export class MessageComponent implements OnInit {
  @Input() users: Array<String>;
  @Input() message: Message;
  time: string;
  fadeTime: boolean;
  user: Object;
  userAvatars;

  constructor(private authService: AuthService,
              private chatService: ChatService
  ) { }

  ngOnInit() {
    setTimeout(()=> {this.updateFromNow(); this.fadeTime = true}, 2000);
    setInterval(()=> {this.updateFromNow()}, 60000);
    
    this.authService.getProfile()
    .subscribe(data => {
      this.user = data.user;
    },
    err => {
      console.log(err);
      return false;
    });


    this.chatService.getUserList()
    .subscribe(data => {
      this.userAvatars = data.users;
    },
    err => {
      // console.log(err);
      return false;
    });


  }

  updateFromNow(): void {
    this.time = moment(this.message.created).fromNow();
  }

  messagefrom() {
    var tmp;
    this.userAvatars.forEach(element => {
      
      if(this.message.from == element.username){
        tmp = element.avatar
      }
      
    });
    return tmp
  }

}
