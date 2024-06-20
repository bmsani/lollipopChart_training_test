/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */
"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { valueFormatter, textMeasurementService } from "powerbi-visuals-utils-formattingutils";
import measureSvgTextWidth = textMeasurementService.measureSvgTextWidth;
import { Selection, select } from "d3-selection";
import { ScalePoint, scalePoint, ScaleLinear, scaleLinear } from "d3-scale";
import { VData } from "./interface";
import { VisualFormattingSettingsModel } from "./settings";
import { sampleData } from "./sampleData";

export class Visual implements IVisual {
  private target: HTMLElement;
  private svg: Selection<SVGElement, any, HTMLElement, any>;
  private scaleX: ScalePoint<string>;
  private dim: [number, number];
  private scaleY: ScaleLinear<number, number>;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private data: VData;

  constructor(options: VisualConstructorOptions) {
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
    if (document) {
      this.svg = select(this.target).append("svg");
    }
  }

  public update(options: VisualUpdateOptions) {
    this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(VisualFormattingSettingsModel, options.dataViews);
    this.data = sampleData;

    const w = options.viewport.width;
    const h = options.viewport.width;
    this.dim = [options.viewport.width, options.viewport.height];
    this.svg.attr("width", this.dim[0]);
    this.svg.attr("height", this.dim[1]);

    //scales
    const targetLabelWidth = this.getTextWidth(this.formatMeasure(this.data.target, this.data.formatString));
    this.scaleX = scalePoint()
      .domain(Array.from(this.data.items, (d) => d.category))
      .range([0, this.dim[0] - targetLabelWidth]);

    this.scaleY = scaleLinear().domain([this.data.minValue, this.data.maxValue]).range([this.dim[1], 0]);

    this.drawTarget();
  }

  private drawTarget() {
    let targetLine = this.svg.selectAll("line.target-line").data([this.data.target]);

    targetLine
      .enter()
      .append("line")
      .classed("target-line", true)
      .attr("x1", 0)
      .attr("y1", this.scaleY(this.data.target))
      .attr("x2", this.scaleX.range()[1])
      .attr("y2", this.scaleY(this.data.target));

    targetLine.attr("x1", 0).attr("y1", this.scaleY(this.data.target)).attr("x2", this.dim[0]).attr("y2", this.scaleY(this.data.target));

    targetLine.exit().remove();
  }

  private formatMeasure(measures: number, fs: string): string {
    const formatter = valueFormatter.create({ format: fs });
    return formatter.format(measures);
  }

  private getTextWidth(txt: string): number {
    const textProperties = {
      test: txt,
      fontFamily: "sans-serif",
      fontSize: "12pt",
    };
    return measureSvgTextWidth(textProperties);
  }

  /**
   * Returns properties pane formatting model content hierarchies, properties and latest formatting values, Then populate properties pane.
   * This method is called once every time we open properties pane or when the user edit any format property.
   */
  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
  }
}
