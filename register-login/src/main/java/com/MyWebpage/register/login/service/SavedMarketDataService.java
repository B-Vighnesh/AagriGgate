package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.SavedMarketData;
import com.MyWebpage.register.login.repositor.SavedMarketDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SavedMarketDataService {

    @Autowired
    private SavedMarketDataRepository repository;

    public SavedMarketData save(SavedMarketData data) {
        return repository.save(data);
    }

    public List<SavedMarketData> getAll(String farmerId) {
        return repository.findByFarmerId(farmerId);
    }

    public void delete(Long id) {
        System.out.println(id);
        repository.deleteById(id);
    }
}
