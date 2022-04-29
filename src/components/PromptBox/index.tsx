import React from 'react'

interface Iprops {
  width: number;
  info: string;
  x?: number;
  y?: number;
}

class Promptbox extends React.Component<Iprops>{
  constructor(props: Iprops) {
    super(props)
  }

  componentDidMount() {
    this.addContent()
  }
  addContent = () => {
    const ctx = document.getElementById('promptCanvas')?.getContext('2d');
    const y = this.props.y || 0;
    if (ctx) {
      const width = this.props.width
      ctx.strokeStyle = '#fff'
      ctx.shadowOffsetX = -2
      ctx.shadowOffsetY = 2
      ctx.shadowBlur = 2
      ctx.shadowColor = 'rgba(0,0,0,.3)'
      ctx.beginPath()
      ctx.moveTo(0, 20 + y)
      ctx.lineTo(8, 16 + y)
      ctx.lineTo(8, 1 + y)
      ctx.lineTo(width - 1, 1 + y)
      ctx.lineTo(width - 1, 39 + y)
      ctx.lineTo(8, 39 + y)
      ctx.lineTo(8, 23 + y)
      ctx.closePath()
      ctx.stroke();
      ctx.fillStyle = '#D3D7F7'
      ctx.textBaseline = 'middle'
      ctx.font = '14px sans-serif'
      ctx.beginPath()
      ctx.fillText(this.props.info, 20, 20 + y);
    }
  }
  render() {
    return (
      <div>
        <canvas key={this.props.info} height='300' width={this.props.width} id='promptCanvas' />
      </div>
    )
  }
}
export default Promptbox