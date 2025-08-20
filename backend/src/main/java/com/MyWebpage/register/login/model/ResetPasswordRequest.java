package com.MyWebpage.register.login.model;


    public class ResetPasswordRequest {
        private String email;
        private String newPassword;
        private Long farmerId;
        private String currentPassword;

        public String getCurrentPassword() {
            return currentPassword;
        }

        public void setCurrentPassword(String currentPassword) {
            this.currentPassword = currentPassword;
        }

        @Override
        public String toString() {
            return "ResetPasswordRequest{" +
                    "email='" + email + '\'' +
                    ", newPassword='" + newPassword + '\'' +
                    ", farmerId=" + farmerId +
                    ", currentPassword='" + currentPassword + '\'' +
                    '}';
        }

        public Long getFarmerId() {
            return farmerId;
        }

        public void setFarmerId(Long farmerId) {
            this.farmerId = farmerId;
        }

        // Getters and Setters
        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }

    }


