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
      .range([0, this.dim[0] - targetLabelWidth - 12 / 2]) // 12 is fontSize
      .padding(0.5);

    this.scaleY = scaleLinear()
      .domain([this.data.minValue, this.data.maxValue])
      .range([this.dim[1] - 10, 0 + 10]); // 10 is radius value

    this.drawTarget();
    this.drawTargetLabel();
    this.drawConnectors();
    this.drawDataPoints();
    this.drawCategoryLabels();
  }

  private drawTarget() {
    const targetLine = this.svg.selectAll("line.target-line").data([this.data.target]);

    targetLine
      .enter()
      .append("line")
      .classed("target-line", true)
      .attr("x1", 0)
      .attr("y1", this.scaleY(this.data.target))
      .attr("x2", this.scaleX.range()[1])
      .attr("y2", this.scaleY(this.data.target));

    targetLine.attr("x1", 0).attr("y1", this.scaleY(this.data.target)).attr("x2", this.scaleX.range()[1]).attr("y2", this.scaleY(this.data.target));

    targetLine.exit().remove();
  }

  private drawTargetLabel() {
    const targetLabel = this.svg.selectAll("text.target-label").data([this.data.target]);

    targetLabel
      .enter()
      .append("text")
      .classed("target-label", true)
      .attr("x", this.scaleX.range()[1] + 12 / 2) // 12 is fontsize
      .attr("y", this.scaleY(this.data.target))
      .attr("font-size", "12pt")
      .attr("font-family", "sans-serif")
      .text(this.formatMeasure(this.data.target, this.data.formatString));

    targetLabel
      .attr("x", this.scaleX.range()[1] + 12 / 2) // 12 is fontsize
      .attr("y", this.scaleY(this.data.target))
      .attr("font-size", "12pt")
      .attr("font-family", "sans-serif")
      .text(this.formatMeasure(this.data.target, this.data.formatString));

    targetLabel.exit().remove();
  }

  private drawDataPoints() {
    const dataPoints = this.svg.selectAll("circle.data-point").data(this.data.items);

    dataPoints
      .enter()
      .append("circle")
      .classed("data-point", true)
      .attr("cx", (d) => this.scaleX(d.category))
      .attr("cy", (d) => this.scaleY(d.value))
      .attr("r", 10);

    dataPoints
      .attr("cx", (d) => this.scaleX(d.category))
      .attr("cy", (d) => this.scaleY(d.value))
      .attr("r", 10);

    dataPoints.exit().remove();
  }

  private drawConnectors() {
    const connectors = this.svg.selectAll("line.connector").data(this.data.items);

    connectors
      .enter()
      .append("line")
      .classed("connector", true)
      .attr("ix", (d, i) => i)
      .attr("x1", (d) => this.scaleX(d.category))
      .attr("y1", (d) => this.scaleY(this.data.target))
      .attr("x2", (d) => this.scaleX(d.category))
      .attr("y2", (d) => {
        if (Math.abs(this.scaleY(this.data.target) - this.scaleY(d.value)) <= 10) {
          // 10 is radius value
          return this.scaleY(this.data.target);
        } else if (this.scaleY(this.data.target)) {
          return this.scaleY(d.value) + 10; // 10 is radius value
        } else {
          return this.scaleY(d.value) - 10; // 10 is radius value
        }
      });

    connectors
      .attr("x1", (d) => this.scaleX(d.category))
      .attr("y1", (d) => this.scaleY(this.data.target))
      .attr("x2", (d) => this.scaleX(d.category))
      .attr("y2", (d) => {
        if (Math.abs(this.scaleY(this.data.target) - this.scaleY(d.value)) <= 10) {
          // 10 is radius value
          return this.scaleY(this.data.target);
        } else if (this.scaleY(this.data.target)) {
          return this.scaleY(d.value) + 10; // 10 is radius value
        } else {
          return this.scaleY(d.value) - 10; // 10 is radius value
        }
      });

    connectors.exit().remove();

    return connectors;
  }

  private drawCategoryLabels() {
    const catLabels = this.svg.selectAll("text.category-label").data(this.data.items);

    catLabels
      .enter()
      .append("text")
      .classed("category-label", true)
      .attr("x", (d) => this.scaleX(d.category))
      .attr("y", (d) => {
        if (d.value >= this.data.target) {
          return this.scaleY(this.data.target) + 12; // 12 is fontSize
        } else {
          return this.scaleY(this.data.target) - 12;
        }
      })
      .text((d) => d.category);

    catLabels
      .attr("x", (d) => this.scaleX(d.category))
      .attr("y", (d) => {
        if (d.value >= this.data.target) {
          return this.scaleY(this.data.target) + 12; // 12 is fontSize
        } else {
          return this.scaleY(this.data.target) - 12;
        }
      })
      .text((d) => d.category);

    catLabels.exit().remove();
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
