package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
public class UserListController {

	@Autowired
	private UserRepository userRepository;

	@GetMapping("/users")
	public List<User> getAllActiveUsers() {
		return userRepository.findAllActiveUsers();
	}
}
