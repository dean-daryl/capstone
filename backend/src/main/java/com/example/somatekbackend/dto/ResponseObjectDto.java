package com.example.somatekbackend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class ResponseObjectDto implements Serializable {

    private static final Logger LOGGER = LoggerFactory.getLogger(ResponseObjectDto.class);


    private Boolean status;
    private Object data;
    private String message;

    public ResponseObjectDto(Exception exception) {
        LOGGER.error(ExceptionUtils.getStackTrace(exception));
        this.status = false;
        this.data = null;
        this.message = exception.getMessage();
    }

    public ResponseObjectDto(Object data) {
        this.status = true;
        this.data = data;
        this.message = "Success";
    }

    public ResponseObjectDto(String message) {
        LOGGER.error(message);
        this.message =message;
        this.status = false;
        this.data = null;
    }

    public ResponseObjectDto(Exception ex, String message) {
        LOGGER.error(ExceptionUtils.getStackTrace(ex));
        this.message = message;
        this.status = false;
        this.data = null;
    }

    public ResponseObjectDto(Object data, String message) {
        this.message =message;
        this.status = true;
        this.data = data;
    }

}