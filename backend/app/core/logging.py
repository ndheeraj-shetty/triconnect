import logging
import sys
from logging.handlers import RotatingFileHandler
import os

def setup_logging():
    """Configure system-wide logging with rotating files and console outputs."""
    log_formatter = logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s - %(message)s"
    )
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Console Handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(log_formatter)
    root_logger.addHandler(console_handler)
    
    # File Handler
    log_dir = "logs"
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
        
    file_handler = RotatingFileHandler(
        os.path.join(log_dir, "app.log"),
        maxBytes=10*1024*1024, # 10MB
        backupCount=5
    )
    file_handler.setFormatter(log_formatter)
    root_logger.addHandler(file_handler)
    
    # Quiet verbose library loggers
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("jose").setLevel(logging.WARNING)
    logging.getLogger("passlib").setLevel(logging.WARNING)
    
    logger = logging.getLogger("triconnect")
    logger.info("Logging successfully initialized.")
    return logger

logger = setup_logging()
