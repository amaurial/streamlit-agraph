import os
import csv
import json

from operator import itemgetter
import streamlit.components.v1 as components
import streamlit as st

from streamlit_agraph import data

from streamlit_agraph.config import Config, ConfigBuilder
from streamlit_agraph.triple import Triple
from streamlit_agraph.node import Node
from streamlit_agraph.edge import Edge
from streamlit_agraph.triplestore import TripleStore

_RELEASE = False

if _RELEASE:
    parent_dir = os.path.dirname(os.path.abspath(__file__))
    build_dir = os.path.join(parent_dir, "frontend/build")
    _agraph = components.declare_component("agraph", path=build_dir)
else:
    _agraph = components.declare_component(
        "agraph",
        url="http://localhost:3001",
    )
      
def agraph(nodes, edges, config, menus=None):
    node_ids = [node.id for node in nodes]
    if len(node_ids) > len(set(node_ids)):
        st.warning("Duplicated node IDs exist.")
    nodes_data = [ node.to_dict() for node in nodes]
    edges_data = [ edge.to_dict() for edge in edges]
    config_json = json.dumps(config.__dict__)
    data = { "nodes": nodes_data, "edges": edges_data, "menuitems": menus if menus else {}}
    data_json = json.dumps(data)
    component_value = _agraph(data=data_json, config=config_json)
    return component_value


if not _RELEASE:
    st.set_page_config(layout="wide") # layout="wide"

    st.title("Streamlit Agraph 2.0")

    nodes, edges = data.load_graph_data()

    # Build the configs and save them to a file copy&paste dict to config directly.
    config_builder = ConfigBuilder(nodes)
    config = config_builder.build()
    # config.save("config.json")

    # config = Config(from_json="config.json")

    # config = Config(width=st.session_state.width,
    #                 height=st.session_state.height,
    #                 directed=st.session_state.directed,
    #                 physics=st.session_state.physics,
    #                 hierarchical=st.session_state.hierarchical,
    #                 **kwargs,
    #                 )

    menus = {"item1": "Text item1", "item2": "Text item2", "item3": "Text item3", "item4": "Text item4"}
    return_value = agraph(nodes=nodes, edges=edges, config=config)


    st.write(return_value)
