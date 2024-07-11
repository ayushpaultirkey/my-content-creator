export default function ServerEvent(url, { onOpen, onMessage, onFinish, onError }) {

    const _source = new EventSource(url);                
    _source.onopen = () => {

        if(onOpen) { onOpen() };

    };
    _source.onmessage = async (event) => {

        try {

            const _data = JSON.parse(event.data.split("data:"));

            if(!_data.success) {
                throw new Error(_data.message);
            };

            if(_data.finished) {
                if(onFinish) { await onFinish(_data) };
            };
            
            if(onMessage) { await onMessage(_data); };

        }
        catch(error) {

            if(onError) { onError(_source.readyState, error) };
            _source.close();

        };

    };
    _source.onerror = () => {
        
        if(onError) { onError(_source.readyState) };
        _source.close();

    };

};