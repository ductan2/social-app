terraform {
  backend "s3" {
    bucket  = "chatappbydt" # Your unique AWS S3 bucket
    # create a sub-folder called develop
    key     = "developer/chatappbydt.tfstate"
    region  = var.aws_region # Your AWS region
    encrypt = true
  }
}

locals {
  prefix = "${var.prefix}-${terraform.workspace}"

  common_tags = {
    Environment = terraform.workspace
    Project     = var.project
    ManagedBy   = "Terraform"
    Owner       = "Nguyenductan"
  }
}