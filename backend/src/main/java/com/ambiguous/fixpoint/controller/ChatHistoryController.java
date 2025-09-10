package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.ChatMessage;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.ChatMessageRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private UserRepository userRepository;

	@GetMapping("/history")
	public List<ChatMessage> getChatHistory(@RequestParam Long userId, Principal principal) {
		if (principal == null) {
			System.err.println("[ChatHistoryController] Principal is null. User not authenticated.");
			throw new RuntimeException("User not authenticated");
		}
		Optional<User> currentUserOpt = userRepository.findByUsername(principal.getName());
		Optional<User> otherUserOpt = userRepository.findById(userId);
		if (currentUserOpt.isEmpty()) {
			System.err.println("[ChatHistoryController] Current user not found: " + principal.getName());
			throw new RuntimeException("Current user not found");
		}
		if (otherUserOpt.isEmpty()) {
			System.err.println("[ChatHistoryController] Other user not found: " + userId);
			throw new RuntimeException("Other user not found");
		}
		return chatMessageRepository.findConversationBetweenUsers(currentUserOpt.get(), otherUserOpt.get());
	}
}
