import Config from "@library/config";
import Dispatcher from "@library/h12.dispatcher";
import ServerEvent from "@library/serverevent.p";

import DViewer from "@component/google/drive/viewer";
import YTUploader from "@component/google/youtube/uploader";

// @Component
// Component used to tell the h12.transformer
// to convert the elements into funtions

async function OpenGDriveViewer() {
        
    if(!this.child["GDrive"]) {
        
        this.Set("{e.gdrive}", <><DViewer args ref="DViewer" id="GDrive"></DViewer></>);
        this.child["GDrive"].OnImport = async function() {

            Dispatcher.Call(Config.ON_LOADER_SHOW);
            Dispatcher.Call(Config.ON_LOADER_UPDATE, "Downloading File");

            try {
                
                const { Project } = this.parent;
                if(!Project) {
                    throw new Error("Invalid project")
                };

                const _fileId = this.Selected;
                const  _response = await fetch(`/api/frame/drive/import?pid=${Project.id}&fid=${JSON.stringify(_fileId)}`);
                const { success, message } = await _response.json();
        
                if(!success || !_response.ok) {
                    throw new Error(message);
                };
        
                this.Hide();
                alert("Files imported");
                Dispatcher.Call(Config.ON_FASSET_UPDATE);
        
            }
            catch(error) {
                alert(error);
                console.error(error);
                Dispatcher.Call(Config.ON_LOADER_HIDE);
            };

            Dispatcher.Call(Config.ON_LOADER_HIDE);


        };
        
        console.warn("DViewer imported");

    };
    this.child["GDrive"].Show(this.Project);
    
}
async function OpenYTUploader() {

    if(!this.Project) {
        return false;
    };

    if(!this.child["GYoutube"]) {
        this.Set("{e.ytupload}", <><YTUploader args ref="YTUploader" id="GYoutube"></YTUploader></>);
        this.child["GYoutube"].OnUpload = async function({ title, description, category, onStart, onEnd }) {

            try {

                onStart();

                const { Project } = this.parent;
                if(!Project) {
                    return false;
                };

                if(title.length < 2 || description.length < 2) {
                    throw new Error("Please enter title and description");
                };
    
                ServerEvent(`/api/frame/youtube/upload?pid=${Project.id}&t=${title}&d=${description}&c=${category}`, {
                    onOpen: () => {

                        Dispatcher.Call(Config.ON_LOADER_SHOW);
                        Dispatcher.Call(Config.ON_LOADER_UPDATE, "Uploading Video");

                    },
                    onMessage: (data) => {

                        Dispatcher.Call(Config.ON_LOADER_SHOW);
                        Dispatcher.Call(Config.ON_LOADER_UPDATE, data.message);
                        
                    },
                    onFinish: () => {

                        alert("Video uploaded to youtube !");
                        Dispatcher.Call(Config.ON_LOADER_HIDE);

                    },
                    onError: (status, message) => {

                        if(status !== EventSource.CLOSED && message) {
                            alert(message);
                        };
                        Dispatcher.Call(Config.ON_LOADER_HIDE);

                    }
                });
    
            }
            catch(error) {
                alert(error);
                console.error(error);
                onEnd();
            };

        };
        console.warn("YTUploader imported");
    };

    const { title, description } = this.Project.property;
    this.child["GYoutube"].Show({
        title: title,
        description: description
    });

};

export default { OpenGDriveViewer, OpenYTUploader };