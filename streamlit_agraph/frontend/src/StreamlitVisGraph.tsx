import React from 'react';
import VisGraph, { GraphData, GraphEvents, Network, Options } from "react-vis-graph-wrapper"
import Position from "vis-network"
import { Streamlit } from "streamlit-component-lib";
import { useRenderData } from "streamlit-component-lib-react-hooks";

//import * as events from "events"

let mynetwork;

function isNullOrEmpty(str) {
  return str === null || str === undefined || (typeof str === 'string' && str.trim().length === 0);
}

function StreamlitVisGraph() {

  const renderData = useRenderData();

  const graphIn = JSON.parse(renderData.args["data"])

  const options: Options = JSON.parse(renderData.args["config"])

  const menuitems = graphIn.menuitems;

  const lookupNodeId = (lookupNode, myNodes) => myNodes.find(node => node.id === lookupNode);

  const graph: GraphData = { nodes: graphIn.nodes.slice(), edges: graphIn.edges.slice() }

  const contextMenu = document.getElementById("streamlit-agraph-custom-context-menu")

  let oncontext_event= null;

  document.addEventListener('contextmenu', function(e) {
    let position = {x: e.clientX, y: e.clientY };
    const nodeid = mynetwork.getNodeAt(position);
    //console.log(e);
    //console.log(nodeid);
    //console.log(menuitems);
    if (nodeid === undefined || isNullOrEmpty(menuitems.keys)){
      contextMenu.style.display = 'none';
      contextMenu.style.visibility = "hidden";
      return;
    }

    oncontext_event = e;
    oncontext_event.preventDefault();
    mynetwork.selectNodes([nodeid]);
    contextMenu.style.display = 'block';
    contextMenu.style.left = oncontext_event.pageX + 'px';
    contextMenu.style.top = oncontext_event.pageY + 'px';
    contextMenu.style.visibility = 'visible';
  });

  let menuItemsElement = document.getElementById("streamlit-agraph-context-menu-list");
  //console.log("menuItems", menuItemsElement);
  for (let item in menuitems) {
    if (menuItemsElement.querySelector("#" + item) === null){
      let newitem = document.createElement("li");
      newitem.setAttribute("id", item);
      newitem.textContent = menuitems[item];
      menuItemsElement.appendChild(newitem);
    }
  }


  const menuOptions = document.querySelectorAll('.streamlit-agraph-context-menu li');
  menuOptions.forEach(option => {
    option.addEventListener('click', function() {
      const selectedOption = this.id;
      Streamlit.setComponentValue([`MENU;${selectedOption}`,mynetwork.getSelectedNodes()]);
      contextMenu.style.display = 'none';
    });
  });

  const events: GraphEvents = {
    click: (event) =>{
      contextMenu.style.visibility = "hidden";
    },
    selectNode: (event) => {
      contextMenu.style.visibility = "hidden";
      Streamlit.setComponentValue(["SELECT_NODE", event.nodes[0]]);
    },
    selectEdge: (event) => {
      contextMenu.style.visibility = "hidden";
      Streamlit.setComponentValue(["SELECT_EDGE", event.edges[0]]);
    }
    ,
    doubleClick: (event) => {
      contextMenu.style.visibility = "hidden";
      const lookupNode = lookupNodeId(event.nodes[0], graph.nodes);
      if (lookupNode && lookupNode.link_enabled && lookupNode.link) {
        const link = lookupNode.link;
        if (link) {
          window.open(link);
        }
      }
      else{
        Streamlit.setComponentValue(["DOUBLE_CLICK", event.nodes[0]])
      }
    },

  };

  return (
    <span>
      <VisGraph
        graph={graph}
        options={options}
        events={events}
        ref = {(network: any) => {
          mynetwork = network;
          //console.log(network)
        }}
      />
    </span>
  )
}

export default StreamlitVisGraph;
