package com.ambiguous.fixpoint.controller;

import com.ambiguous.fixpoint.entity.ChatMessage;
import com.ambiguous.fixpoint.entity.User;
import com.ambiguous.fixpoint.repository.ChatMessageRepository;
import com.ambiguous.fixpoint.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendToUser;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Optional;

@Controller
public class ChatController {

	@Autowired
	private SimpMessagingTemplate messagingTemplate;

	@Autowired
	private ChatMessageRepository chatMessageRepository;

	@Autowired
	private UserRepository userRepository;

	@MessageMapping("/chat.send")
	public void sendMessage(@Payload ChatMessage chatMessage, Principal principal) {
		// Find sender and receiver
		Optional<User> senderOpt = userRepository.findByUsername(principal.getName());
		Optional<User> receiverOpt = userRepository.findById(chatMessage.getReceiver().getId());
		if (senderOpt.isPresent() && receiverOpt.isPresent()) {
			chatMessage.setSender(senderOpt.get());
			chatMessage.setReceiver(receiverOpt.get());
			chatMessageRepository.save(chatMessage);
			// Send to receiver
			messagingTemplate.convertAndSendToUser(
				receiverOpt.get().getUsername(),
				"/queue/messages",
				chatMessage
			);
			// Optionally, send to sender for confirmation
			messagingTemplate.convertAndSendToUser(
				senderOpt.get().getUsername(),
				"/queue/messages",
				chatMessage
			);
		}
	}
}
