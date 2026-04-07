package com.MyWebpage.register.login.market.mandi;

import java.util.List;

public interface MarketBatchRepository {

    void batchInsertIgnore(List<Market> markets);
}
