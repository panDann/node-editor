import styles from './index.less';
import cht from './test.cht';
import EBase from '@src/base';
import {useBase} from '@src/base/index-hook';
import { EOption } from '@src/base/option';
import { BarChart } from 'echarts/charts';

EBase.use(BarChart)
const HookChart = useBase(BarChart)
const option = new EOption({
  title:{text:'333'},
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ['product', '2015', '2016', '2017'],
      ['Matcha Latte', 43.3, 85.8, 93.7],
      ['Milk Tea', 83.1, 73.4, 55.1],
      ['Cheese Cocoa', 86.4, 65.2, 82.5],
      ['Walnut Brownie', 72.4, 53.9, 39.1]
    ]
  },
  xAxis: { type: 'category' },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [
    { type: 'bar' },
    { type: 'bar' },
    { type: 'bar' }
  ]
})
let count = 0
export default function IndexPage() {
  const onClick = () => {
    // option.setTheme('dark')
    option.assign('title',{text:++count+''})
  }
    option.setExtra('theme','dark')
    option.assign('title',{text:++count+''})
    return (
    <div>
      <h1 className={styles.title} onClick={onClick}>主题</h1>
      <h1 className={styles.title} onClick={onClick}>resize</h1>
      <div style={{ height: 300, width: 300 }}>
        <EBase option={option} />
        {/* <HookChart option={option} /> */}
      </div>
    </div>
  );
}
