package com.decisionhub.service;

import com.decisionhub.model.User;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class PasswordResetEmailService {
    private final JavaMailSender mailSender;
    private final String from;
    private final String resetUrl;
    private final long tokenTtlMinutes;

    public PasswordResetEmailService(JavaMailSender mailSender,
                                     @Value("${app.password-reset.from:no-reply@decisionhub.local}") String from,
                                     @Value("${app.password-reset.url:http://127.0.0.1:3000/reset-password}") String resetUrl,
                                     @Value("${app.password-reset.token-ttl-minutes:30}") long tokenTtlMinutes) {
        this.mailSender = mailSender;
        this.from = from;
        this.resetUrl = resetUrl;
        this.tokenTtlMinutes = tokenTtlMinutes;
    }

    public void send(User user, String rawToken) {
        String separator = resetUrl.contains("?") ? "&" : "?";
        String link = resetUrl + separator + "token=" + URLEncoder.encode(rawToken, StandardCharsets.UTF_8);
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(user.getEmail());
        message.setSubject("Reset your DecisionHub password");
        message.setText("Hello " + user.getName() + ",\n\n"
                + "Use this link to reset your DecisionHub password:\n" + link + "\n\n"
                + "This link expires in " + tokenTtlMinutes + " minutes. If you did not request this, you can ignore this email.");
        mailSender.send(message);
    }
}
