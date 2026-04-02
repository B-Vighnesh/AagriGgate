package com.MyWebpage.register.login.market.ingestion;

import java.util.List;
import java.util.Map;

public final class StateDistrictMapping {

    public static final Map<String, List<String>> STATES_AND_DISTRICTS = Map.of(
            "Karnataka",
            List.of(
                    "Bagalkot", "Bangalore", "Belgaum", "Bellary", "Bidar", "Bijapur", "Chamrajnagar",
                    "Chikmagalur", "Chitradurga", "Davangere", "Dharwad", "Gadag", "Hassan", "Haveri",
                    "Kalburgi", "Karwar(Uttar Kannad)", "Kolar", "Koppal", "Madikeri(Kodagu)", "Mandya",
                    "Mangalore(Dakshin Kannad)", "Mysore", "Raichur", "Shimoga", "Tumkur", "Udupi", "Yadgiri"
            )
    );

    private StateDistrictMapping() {
    }
}
