import { Progress } from 'antd';

const ProgressBar = ({ assigned = 0, required = 0 }) => {
    const safeRequired = required > 0 ? required : 1;
    const percent = Math.round((assigned / safeRequired) * 100);
    return <Progress percent={percent} size="small" style={{ marginTop: 8 }} />;
};

export default ProgressBar;
