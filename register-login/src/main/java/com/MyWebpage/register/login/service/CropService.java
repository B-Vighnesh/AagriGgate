package com.MyWebpage.register.login.service;

import com.MyWebpage.register.login.model.Crop;
import com.MyWebpage.register.login.model.Farmer;
import com.MyWebpage.register.login.repositor.CropRepo;
import com.MyWebpage.register.login.repositor.FarmerRepo;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;

@Service
public class CropService {

    @Autowired
    private CropRepo cropRepo;
    @Autowired
    private FarmerRepo farmerRepo;


//    public Crop addCrop(Crop crop) {
//
//        Farmer farmer = farmerRepo.findByFarmerId(crop.getFarmer().getFarmerId());
//        Farmer currentFarmer = new Farmer();
//        currentFarmer.setFarmerId(farmer.getFarmerId());
//        crop.setFarmer(currentFarmer);
//
//        System.out.println(crop);
//        System.out.println("service");
//        return cropRepo.save(crop);
//    }


    public List<Crop> getAllCrops() {


        return cropRepo.findAll();
    }


    public List<Crop> getCropsByFarmerId(Long farmerId) {

        return cropRepo.findByFarmerId(farmerId);
    }

    public Crop getCropByCropId(Long cropId) {

        return cropRepo.findById(cropId).orElse(new Crop());
    }


    public void deleteCropById(Long cropId) {
        cropRepo.deleteById(cropId);
    }


    public List<Crop> getCropsByName(String cropName) {
        return cropRepo.findByCropName(cropName);
    }

    public void deleteCropByFarmerId(Long farmerId) {
        cropRepo.deleteByFarmerId(farmerId);
    }

    public Crop addCrop(Crop crop, MultipartFile imageFile) throws IOException {

        Farmer farmer = farmerRepo.findByFarmerId(crop.getFarmer().getFarmerId());
        if (farmer == null) {
            throw new EntityNotFoundException("Farmer not found with ID: " + crop.getFarmer().getFarmerId());
        }

        crop.setFarmer(farmer);
        crop.setPostDate(LocalDate.now().format(DateTimeFormatter.ofPattern("dd-MM-yyyy")));
        if (imageFile != null && !imageFile.isEmpty()) {
            crop.setImageName(imageFile.getOriginalFilename());
            crop.setImageType(imageFile.getContentType());
            crop.setImageData(imageFile.getBytes());
        } else {

        }

        return cropRepo.save(crop);
    }


    public Crop updateCrop(Crop crop, MultipartFile imageFile) throws IOException {
        if (imageFile != null && !imageFile.isEmpty()) {

            crop.setImageName(imageFile.getOriginalFilename());
            crop.setImageType(imageFile.getContentType());
            crop.setImageData(imageFile.getBytes());
        } else {

            Crop existingCrop = cropRepo.findById(crop.getCropID()).orElse(new Crop());
            crop.setImageName(existingCrop.getImageName());
            crop.setImageType(existingCrop.getImageType());
            crop.setImageData(existingCrop.getImageData());
        }
        return cropRepo.save(crop);
    }

}
