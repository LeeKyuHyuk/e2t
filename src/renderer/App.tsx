import { ArrowUpOutlined, FileOutlined, FolderOutlined } from '@ant-design/icons';
import { Button, List } from 'antd';
import * as React from 'react';
import * as Client from 'ssh2-sftp-client';
import * as fs from 'fs';
import { basename } from 'path';
import { dialog } from '@electron/remote';

const sftp = new Client();

function App() {
  const [path, setPath] = React.useState<string>('/');
  const [files, setFiles] = React.useState<Client.FileInfo[]>([]);

  React.useEffect(() => {
    sftp
      .connect({
        host: 'IP주소를 입력하세요',
        port: 22 /* 기본 포트는 22번 입니다 */,
        username: '사용자명을 입력하세요',
        password: '비밀번호를 입력하세요',
      })
      .then(() => {
        return sftp.list(path);
      })
      .then((data) => {
        setFiles(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  React.useEffect(() => {
    sftp.list(path).then((data) => {
      setFiles(data);
    });
  }, [path]);

  function changeDirectory(folderName: string) {
    if (folderName === '..') {
      const paths = path.split('/');
      setPath(`${paths.splice(0, paths.length - 2).join('/')}/`);
    } else {
      setPath(`${path}${folderName}/`);
    }
  }

  function upload(remotePath: string) {
    dialog
      .showOpenDialog({
        title: 'E2T - Download File',
        properties: ['openFile'],
      })
      .then((result) => {
        if (!result.canceled && result.filePaths.length === 1) {
          sftp
            .put(
              fs.createReadStream(result.filePaths[0]),
              `${remotePath}${basename(result.filePaths[0])}`,
            )
            .then(() => console.log('done!'));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function download(remotePath: string, fileName: string) {
    dialog
      .showSaveDialog({
        title: 'E2T - Download File',
        defaultPath: fileName,
      })
      .then((result) => {
        if (!result.canceled && result.filePath) {
          sftp
            .get(`${remotePath}${fileName}`, fs.createWriteStream(result.filePath!))
            .then(() => console.log('done!'));
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <>
      <Button icon={<ArrowUpOutlined />} onClick={() => changeDirectory('..')}>
        상위 폴더로
      </Button>
      <Button icon={<ArrowUpOutlined />} onClick={() => upload(path)}>
        업로드
      </Button>
      <List
        header={<b>{path}</b>}
        bordered
        dataSource={files}
        renderItem={(item) => (
          <List.Item>
            {item.type === 'd' ? (
              <>
                <FolderOutlined />
                <a
                  style={{ width: '100%', paddingLeft: '8px' }}
                  onClick={() => changeDirectory(item.name)}
                >
                  {item.name}
                </a>
              </>
            ) : (
              <>
                <FileOutlined />
                <a
                  style={{ width: '100%', paddingLeft: '8px' }}
                  onClick={() => download(path, item.name)}
                >
                  {item.name}
                </a>
              </>
            )}
          </List.Item>
        )}
      />
    </>
  );
}

export default App;
