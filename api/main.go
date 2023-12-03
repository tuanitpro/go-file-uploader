/*
Author: tuanitpro
Author URI: https://tuanitpro.com
Description: Demo upload file with go lang
Version: 0.0.1
License: GNU General Public License v2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
Text Domain: uploader
Tags:file uploader
*/

package main

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	baseDir := os.Getenv("BASE_DIR")
	if "" == baseDir {
		baseDir = "uploads"
	}
	log.Println("Server started... PORT:5090. BASE_DIR: " + baseDir)
	setupRouters()
}

type ResponseObject struct {
	Code    int `json:"code"`
	Message string `json:"message"`
	FileURL string `json:"fileUrl"`
}

func setupRouters() {
	handler := http.NewServeMux()
	handler.HandleFunc("/", HelloServer)
	handler.HandleFunc("/api/v1/fileupload", uploadFiles)
	log.Fatal(http.ListenAndServe(":5090", handler))
}
func HelloServer(w http.ResponseWriter, r *http.Request) {
    fmt.Fprintf(w, "Hello, Go %s!", r.URL.Path[1:])
}
func uploadFiles(w http.ResponseWriter, r *http.Request) {
	header := w.Header()
	header.Add("Access-Control-Allow-Origin", "*")
	header.Add("Access-Control-Allow-Methods", "DELETE, POST, GET, OPTIONS")
	header.Add("Access-Control-Allow-Headers", "Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With")
	header.Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusBadRequest)
		errorResponse := ResponseObject{
			Code:    http.StatusBadRequest,
			Message: "Accept method POST only",
		}
		var jsonData []byte
		jsonData, err := json.Marshal(errorResponse)
		if err != nil {
			log.Println(err)
		}
		fmt.Fprintf(w, string(jsonData))
		return
	}

	r.ParseMultipartForm(10 << 20)

	formData := r.MultipartForm
	files := formData.File["myFile"]

	var results []ResponseObject

	for i := range files {
		file, err := files[i].Open()
		handler := files[i]
		mimeType := handler.Header.Get("Content-Type")
		if err != nil {
			log.Println(err)
			errorResponse := ResponseObject{
				Code:    http.StatusBadRequest,
				Message: "Error Retrieving the File " + handler.Filename,
			}
			results = append(results, errorResponse)
			return
		}
		defer file.Close()

		switch mimeType {
		case "image/jpeg", "image/png":
			result := writeFileImage(w, file, handler)
			results = append(results, result)
		case "audio/x-ms-wma", "video/mpeg", "video/mp4", "video/x-ms-wmv":
			result := writeFileAudio(w, file, handler)
			results = append(results, result)
		default:
			errorResponse := ResponseObject{
				Code:    http.StatusBadRequest,
				Message: "The format file is not valid " + handler.Filename,
			}
			results = append(results, errorResponse)
		}
	}

	var jsonData []byte
	jsonData, err := json.Marshal(results)
	if err != nil {
		log.Println(err)
	}
	fmt.Fprintf(w, string(jsonData))
}

func writeFileImage(w http.ResponseWriter, file multipart.File, handler *multipart.FileHeader) ResponseObject {
	folderPath := createAndGetFolderPathToUpload("images")
	return writeAnyFile(w, folderPath, file, handler)
}

func writeFileAudio(w http.ResponseWriter, file multipart.File, handler *multipart.FileHeader) ResponseObject {
	folderPath := createAndGetFolderPathToUpload("audios")
	return writeAnyFile(w, folderPath, file, handler)
}

func writeAnyFile(w http.ResponseWriter, folderPath string, file multipart.File, handler *multipart.FileHeader) ResponseObject {
	fileBytes, err := ioutil.ReadAll(file)
	if err != nil {
		log.Println(err)

		errorResponse := ResponseObject{
			Code:    http.StatusCreated,
			Message: "Error Retrieving the File " + handler.Filename,
		}

		return errorResponse
	}

	myFile, _ := os.Create(folderPath + handler.Filename)
	fileWriter := bufio.NewWriter(myFile)
	fileWriter.Write(fileBytes)
	fileWriter.Flush()

	errorResponse := ResponseObject{
		Code:    http.StatusCreated,
		Message: "Successfully uploaded file " + handler.Filename,
	}

	return errorResponse
}

func createAndGetFolderPathToUpload(folderType string) string {
	baseDir := os.Getenv("BASE_DIR")
	if "" == baseDir {
		baseDir = "uploads"
	}
	currentYear := time.Now().Year()
	currentMonth := time.Now().Month()
	intMonth := int(currentMonth)
	stringCurrentMonth := strconv.Itoa(intMonth)
	if intMonth < 10 {
		stringCurrentMonth = "0" + strconv.Itoa(intMonth)
	}
	path := []string{baseDir, "/", folderType, "/", strconv.Itoa(currentYear), "/", stringCurrentMonth, "/"}
	folderPath := strings.Join(path, "")
	error := os.MkdirAll(folderPath, os.ModePerm)
	if error != nil {
		log.Println(error)
	}

	return folderPath
}
