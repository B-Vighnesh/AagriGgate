package com.MyWebpage.register.login.market.saved;

public class SaveMarketRequest {

    private Long marketId;
    private String note;

    public Long getMarketId() {
        return marketId;
    }

    public void setMarketId(Long marketId) {
        this.marketId = marketId;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
