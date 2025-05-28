import { Component, OnInit, signal } from "@angular/core";
import { UserService } from "../../../services/user/user.service";

@Component({
  selector: "app-user-list",
  standalone: true,
  template: `
    <section>
      <h3>Users</h3>
      <ul>
        @for (user of users(); track user._id) {
        <li>{{ user.email }} ({{ user.role }})</li>
        }
      </ul>
    </section>
  `,
})
export class UserListComponent implements OnInit {
  users = signal<any[]>([]);
  constructor(private userService: UserService) {}
  ngOnInit() {
    this.userService.getAllUsers().subscribe((users) => this.users.set(users));
  }
}
