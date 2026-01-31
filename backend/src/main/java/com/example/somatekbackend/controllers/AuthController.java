package com.example.somatekbackend.controllers;

import com.example.somatekbackend.dto.LoginRequest;
import com.example.somatekbackend.dto.ResponseObjectDto;
import com.example.somatekbackend.dto.UserDto;
import com.example.somatekbackend.exception.ResourceExistsException;
import com.example.somatekbackend.service.IOAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

import java.util.Map;


@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private IOAuthService oAuthService;
    @GetMapping("grantcode")
    public RedirectView grantCode(@RequestParam("code") String code, @RequestParam("scope") String scope, @RequestParam("authuser") String authUser, @RequestParam("prompt") String prompt) {
        String response = oAuthService.getOauthAccessTokenGoogle(code);
        String access_token = oAuthService.extractAccessToken(response);
        Map<String, String> data = oAuthService.getProfileDetailsGoogle(access_token);


        return new RedirectView("http://localhost:5173/redirect?token=" + data.get("token") +"&firstname=" + data.get("firstname") +"&lastname=" + data.get("lastname") + "&userId=" + data.get("userId"));
    }
    @PostMapping("login")
    public ResponseObjectDto login(@RequestBody LoginRequest loginRequest) {
        try{
            return new ResponseObjectDto(oAuthService.login(loginRequest));
        }
        catch (Exception e) {
            return new ResponseObjectDto(e.getMessage());
        }
    }
    @PostMapping("signup")
    public ResponseObjectDto signup(@RequestBody UserDto userDto) {
        try{
            return new ResponseObjectDto(oAuthService.signup(userDto)) ;
        }
        catch (ResourceExistsException e) {
            return new ResponseObjectDto(e.getMessage());
        }
        catch (Exception e) {
            return new ResponseObjectDto(e.getMessage());
        }
    }
}
