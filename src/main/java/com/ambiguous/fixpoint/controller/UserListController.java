package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/public/chat")
public class UserListController {

	@Autowired
	private UserRepository userRepository;

	@GetMapping("/users")
	@Transactional(readOnly = true)
	public List<User> getAllActiveUsers() {
		return userRepository.findAllActiveUsers();
	}
}
