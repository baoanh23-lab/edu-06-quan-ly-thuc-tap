
package edu06.edu06.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import edu06.edu06.entity.DoanhNghiep;
import edu06.edu06.service.DoanhNghiepService;

@RestController
@RequestMapping("/api/doanh-nghiep")
@CrossOrigin(origins = "http://localhost:5173")
public class DoanhNghiepController {

    private final DoanhNghiepService doanhNghiepService;

    public DoanhNghiepController(
            DoanhNghiepService doanhNghiepService) {
        this.doanhNghiepService = doanhNghiepService;
    }

    @GetMapping("/ho-so")
    public ResponseEntity<?> layHoSo(
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    doanhNghiepService.layHoSo(authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/ho-so")
    public ResponseEntity<?> capNhatHoSo(
            @RequestBody DoanhNghiep thongTin,
            Authentication authentication) {
        try {
            return ResponseEntity.ok(
                    doanhNghiepService.capNhatHoSo(
                            thongTin, authentication));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage()));
        }
    }
}
