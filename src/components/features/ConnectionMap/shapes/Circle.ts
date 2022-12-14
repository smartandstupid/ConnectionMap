import Shape from './Shape'
import type { ShapeProps, Quarter } from '../types'
import { computeQuarter } from '../utils'
import CurveLineFigure from '../figures/CurveLineFigure'

export default class Circle extends Shape {
    radius: number
    isGrowing: boolean = false
    isDecreasing: boolean = false
    radiusIncreaseValue: number = 0
    curve: CurveLineFigure | null = null
    fill: string = '#E0FFFD'

    constructor (x: number, y: number, radius: number, props?: ShapeProps) {
        super()
        this.x = x
        this.y = y
        this.radius = radius
        
        if (props) {
            this.setupProps(props)
        }
    }

    onClick () {
        if (this.curve) {
            this.curve.delete()
        }

        const existsCurve = this.$root?.findOpenCurve()

        if (existsCurve) {
            this.curve = existsCurve
            this.curve.setEndPoint(this)
        } else {
            this.curve = new CurveLineFigure(this)
            this.$root?.addFigure(this.curve)
        }
    }

    onHover () {
        this.isGrowing = true
        this.reRenderCallback && this.reRenderCallback()
    }

    onHoverOut () {
        this.isGrowing = false
        this.isDecreasing = true
        this.reRenderCallback && this.reRenderCallback()
    }

    computeQuarters (centerX: number, centerY: number) {
        const quarters = new Set<Quarter>()
        
        quarters.add(
            computeQuarter({
                x: this.relativeX - this.radius,
                y: this.relativeY - this.radius,
                centerX,
                centerY,
            })
        )
        quarters.add(
            computeQuarter({
                x: this.relativeX + this.radius,
                y: this.relativeY - this.radius,
                centerX,
                centerY,
            })
        )
        quarters.add(
            computeQuarter({
                x: this.relativeX - this.radius,
                y: this.relativeY + this.radius,
                centerX,
                centerY,
            })
        )
        quarters.add(
            computeQuarter({
                x: this.relativeX + this.radius,
                y: this.relativeY + this.radius,
                centerX,
                centerY,
            })
        )
        this.quarters = [...quarters]
    }

    inEvent (cursor: { x: number, y: number }) {
        const { x, y } = cursor

        return this.radius >= Math.sqrt(
            Math.pow(x - this.relativeX, 2) + Math.pow(y - this.relativeY, 2)
        )
    }

    protected ownRender (ctx: CanvasRenderingContext2D, x: number, y: number) {
        ctx.beginPath()
        ctx.fillStyle = this.fill
        ctx.arc(x, y, this.radius + this.radiusIncreaseValue, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()

        if (this.isGrowing && this.radiusIncreaseValue < 6) {
            this.radiusIncreaseValue += 1
            this.reRenderCallback && this.reRenderCallback()
        } else if (this.isGrowing) {
            this.isGrowing = false
        }

        if (this.isDecreasing && this.radiusIncreaseValue > 0) {
            this.radiusIncreaseValue -= 1
            this.reRenderCallback && this.reRenderCallback()
        } else if (this.isDecreasing) {
            this.isDecreasing = false
        }
    }
}