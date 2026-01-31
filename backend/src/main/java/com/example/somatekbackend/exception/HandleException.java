package com.example.somatekbackend.exception;

import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class HandleException extends RuntimeException {
  private static final Logger LOGGER = LoggerFactory.getLogger(HandleException.class);

  public HandleException(String message) {
    super(message);
  }

  public HandleException(Exception ex, String message) {
    super(message);
    LOGGER.error(ExceptionUtils.getStackTrace(ex));
  }

  public HandleException(Exception ex) {
    super(ex);
    LOGGER.error(ExceptionUtils.getStackTrace(ex));
  }
}
