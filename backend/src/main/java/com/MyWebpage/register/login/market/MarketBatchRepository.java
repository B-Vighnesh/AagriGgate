package com.MyWebpage.register.login.market;

import java.util.List;

public interface MarketBatchRepository {

    void batchInsertIgnore(List<Market> markets);
}
