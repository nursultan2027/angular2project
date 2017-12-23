import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-public-profile',
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.css']
})
export class PublicProfileComponent implements OnInit {

  currentUrl;
  username;
  email;

  constructor(
    private authService: AuthService,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.currentUrl = this.activatedroute.snapshot.params;
    this.authService.getPublicProfile(this.currentUrl.username).subscribe(data => {
      this.username = data.user.username;
      this.email = data.user.email;
    });
  }

}
