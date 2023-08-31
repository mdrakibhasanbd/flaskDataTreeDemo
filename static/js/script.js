
var url = "/tree";
// Load the data from a URL using d3.json()
d3.json(url).then(function (data) {
  var colourScale = d3.scaleOrdinal()
    .domain([0, 1, 2, 3])
    .range(["#abacab", "#53e28c", "#4b80fa"]);

  function select2DataCollectName(d) {
    if (d.children) d.children.forEach(select2DataCollectName);
    else if (d._children) d._children.forEach(select2DataCollectName);
    if (!d.children && d.data.searchable == "YES")
      select2Data.push(d.data.name);
  }

  //===============================================
  function searchTree(d) {
    if (d.children) d.children.forEach(searchTree);
    else if (d._children) d._children.forEach(searchTree);
    var searchFieldValue = eval(searchField);
    if (
      searchFieldValue &&
      searchFieldValue.toLowerCase().match(searchText.toLowerCase())
    ) {
      // Walk parent chain
      var ancestors = [];
      var parent = d;
      while (typeof parent !== "undefined" && parent !== null) {
        ancestors.push(parent);
        //console.log(parent);
        parent.class = "found";
        parent = parent.parent;
      }
      console.log(ancestors);
    }
  }
  //===============================================
  function clearAll(d) {
    d.class = "";
    if (d.children) d.children.forEach(clearAll);
    else if (d._children) d._children.forEach(clearAll);
  }
  //===============================================
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      //set the parent object in all the children
      d._children.forEach(function (d1) {
        d1.parent = d;
        collapse(d1);
      });
      d.children = null;
    }
  }
  //===============================================
  function collapseAllNotFound(d) {
    if (d.children) {
      if (d.class !== "found") {
        d._children = d.children;
        d._children.forEach(collapseAllNotFound);
        d.children = null;
      } else d.children.forEach(collapseAllNotFound);
    }
  }
  //===============================================
  function expandAll(d) {
    if (d._children) {
      d.children = d._children;
      d.children.forEach(expandAll);
      d._children = null;
    } else if (d.children) d.children.forEach(expandAll);
  }
  //===============================================
  // Toggle children on click.
  function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else {
      d.children = d._children;
      d._children = null;
    }
    clearAll(root);
    update(d);
    $("#search").select2("val", "");
  }
  //===============================================
  $("#search").on("select2-selecting", function (e) {
    clearAll(root);
    expandAll(root);
    update(root);
    searchField = "d.data.name";
    searchText = e.object.text;
    searchTree(root);
    root.children.forEach(collapseAllNotFound);
    update(root);
  });



  // Get the dimensions of the device window
  var windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  // Set the margins for the diagram
  var margin = { top: 10, right: 20, bottom: 10, left: 100 };

  // Calculate the width and height of the SVG element
  var width = windowWidth - margin.left - margin.right;
  var height = windowHeight - margin.top - margin.bottom;

  // Append the SVG element to the body of the page
  var svg = d3
    .select("body")
    .style("background-color", "#e5e4e2")
    .append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .call(
      d3.zoom().on("zoom", () => {
        svg.attr("transform", d3.event.transform);
      })
    )
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var i = 0,
    duration = 450,
    root;
  const imageWidth = 60;
  const imageHeight = 60;

  // Declares a tree layout and assigns the size
  var treemap = d3.tree().size([height, width]);

  // Assigns parent, children, height, depth
  root = d3.hierarchy(data, function (d) {
    return d.children;
  });
  root.x0 = height / 2;
  root.y0 = 0;

  // Collapse after the second level
  root.children.forEach(collapse);

  update(root);


  select2Data = [];
  select2DataCollectName(root);
  select2DataObject = [];
  select2Data
    .sort(function (a, b) {
      if (a > b) return 1; // sort
      if (a < b) return -1;
      return 0;
    })
    .filter(function (item, i, ar) {
      return ar.indexOf(item) === i;
    }) // remove duplicate items
    .filter(function (item, i, ar) {
      select2DataObject.push({
        id: i,
        text: item,
      });
    });
  $("#search").select2({
    placeholder: "Search User Or Splitter",
    data: select2DataObject,
    containerCssClass: "search",
  });


  // Collapse the node and all it's children
  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d._children.forEach(collapse);
      d.children = null;
    }
  }

  function update(source) {
    // Assigns the x and y position for the nodes
    var data = treemap(root);

    // Compute the new tree layout.
    var nodes = data.descendants(),
      links = data.descendants().slice(1);

    // Normalize for fixed-depth.
    nodes.forEach(function (d) {
      d.y = d.depth * 180;
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll("g.node").data(nodes, function (d) {
      return d.id || (d.id = ++i);
    });



    // Enter any new modes at the parent's previous position.
    var nodeEnter = node

      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on("click", click);

    nodeEnter
      .append("image")
      .attr("xlink:href", (d) => d.data.icon)
      // .attr("clip-path", (d) => `circle(${imageWidth / 2}px)`)
      .attr("clip-path", (d) => {
        const placeholder = "###IMAGE_WIDTH###";
        const clipPath = `circle(${placeholder}px)`;
        return clipPath.replace(placeholder, imageWidth / 2);
      })

      .attr("width", imageWidth)
      .attr("height", imageHeight)
      .attr("x", -imageWidth / 2)
      .attr("y", -imageHeight / 2)
      .on("contextmenu", showContextMenu)


      // .filter(function (d) {
      //   return d.data.nodetype !== "user";
      // })

      //ON CLICK THEN TRIGGER
      // .on("click", selectNodeId);
      //MOUSE HOVER THEN TRIGGER
      // .on("mouseover", selectNodeId)
      .on("onclick", selectNodeId)
      .on("mouseover", selectNodeName);

    nodeEnter
      .append("circle")
      .attr("r", function (d) {
        // return d.data.value;
        return d.data.value;
      })
      .style("stroke", function (d) {
        return d.data.type;
      })

      .on("contextmenu", showContextMenu)

      // .filter(function (d) {
      //   return d.data.nodetype !== "user";
      // })

      //ON CLICK THEN TRIGGER
      // .on("click", selectNodeId);
      //MOUSE HOVER THEN TRIGGER
      // .on("mouseover", selectNodeId)
      .on("onclick", selectNodeId)
      .on("mouseover", selectNodeName);

    // Add labels for the nodes
    nodeEnter
      .append("text")
      .attr("dy", ".35em")
      .attr("x", function (d) {
        return d.children || d._children ? -30 : 30;
      })
      .attr("text-anchor", function (d) {
        return d.children || d._children ? "end" : "start";
      })
      .text(function (d) {
        return d.data.name;
      });

    var blink = function () {
      nodeEnter
        .filter(function (d) {
          return d.data.nodetype === "user";
        })
        .select("circle")
        .transition()
        .duration(500)
        .style("opacity", 0.5)
        .transition()
        .duration(700)
        .style("opacity", 1)
        .on("end", blink);
    };

    // Start the blinking animation
    blink();

    // node pop up
    node
      .filter(function (d) {
        return d.data.nodetype === "user";
      })
      // select the specific node by its class
      .on("mouseover", function (d) {
        d3.select("#node-popup") // select the pop-up element
          .style("display", "block") // show the pop-up
          .html("ID: " + d.data._id + "<br>Name: " + d.data.name) // set the pop-up text to the node data
          .style("left", d3.event.pageX + 10 + "px") // position the pop-up to the right of the cursor
          .style("top", d3.event.pageY - 20 + "px");
      })
      .on("mouseout", function (d) {
        d3.select("#node-popup") // select the pop-up element
          .style("display", "none"); // hide the pop-up
      });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

    // Update the node attributes and style
    nodeUpdate
      .select("circle.node")
      .attr("r", 6)
      .attr("fill-opacity", "0.7")
      .attr("stroke-opacity", "1")
      .style("fill", function (d) {
        if (d.class === "found") {
          // return "#ff4136"; //red
          return "#36F5FF"; //red
        } else {
          return typeof d._children !== "undefined"
            ? colourScale(findParent(d))
            : "#FFF";
        }
      })
      .style("stroke", function (d) {
        if (d.class === "found") {
          // return "#ff4136"; //red
          return "#36F5FF"; //red
        } else {
          return colourScale(findParent(d));
        }
      });

    // Remove any exiting nodes
    var nodeExit = node
      .exit()
      .transition()
      .duration(duration)
      .attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

    // On exit reduce the node circles size to 0
    nodeExit.select("circle").attr("r", 1e-6);

    // On exit reduce the opacity of text labels
    nodeExit.select("text").style("fill-opacity", 1e-6);

    // ****************** links section ***************************

    // // Update the links...
    var link = svg.selectAll("path.link").data(links, function (d) {
      return d.id;
    });
    const linkEnter = link
      .enter()
      .insert("path", "g")
      .attr("class", "link")
      .style("stroke", function (d) {
        return d.data.level;
      })
      .attr("d", (d) => {
        const o = { x: source.x0, y: source.y0 };
        return diagonal(o, o);
      });

    // Transition the links to their new position
    var linkUpdate = link.merge(linkEnter);

    linkUpdate.transition()
      .duration(duration)
      .attr("d", function (d) {
        return diagonal(d, d.parent);
      })
      .style("stroke", function (d) {
        if (d.class === "found") {
          return "#36F5FF"; // Highlight color for found nodes
        } else {
          return d.data.level; // Link color based on parent nodes
        }
      });

    // Remove any old links
    link.exit()
      .transition()
      .duration(duration)
      .style("stroke-opacity", 0) // Fade out the stroke
      .remove();
    // // Store the old positions for transition.
    nodes.forEach(function (d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {
      path = `M ${s.y} ${s.x}
          C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;

      return path;
    }

    // Toggle children on click.
    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }
  }


  const menu = d3.select(".menu");


  function showContextMenu(d) {
    d3.event.preventDefault();

    menu
      .style("left", d3.event.pageX + "px")
      .style("top", d3.event.pageY + "px")
      .style("display", "block");

    // Add event listener to the body to close the context menu when clicking outside of it
    d3.select("body").on("click.menu", () => {
      const isClickedOnMenu = menu.node().contains(d3.event.target);
      if (!isClickedOnMenu) {
        menu.style("display", "none");
        d3.select("body").on("click.menu", null); // Remove the event listener
      }
    });
  }

  svg.on("click", () => {
    menu.style("display", "none");
    d3.select("body").on("click.menu", null); // Remove the event listener
  });

  function selectNodeId(d) {
    // Update the input fields with the selected node's data
    document.getElementById("input-id").value = d.data._id;
    //  document.getElementById("rename-id").value = d.data._id;
    // Optionally, update any other parts of the UI with the selected node's data

    // Log the selected node to the console
    // console.log("Selected node ID:", d.data._id);
  }

  function selectNodeName(d) {
    // Update the input fields with the selected node's data
    document.getElementById("old-name").value = d.data.name;
    document.getElementById("rename-id").value = d.data._id;
    document.getElementById("rename-id2").value = d.data._id;
    document.getElementById("delete-id").value = d.data._id;
    document.getElementById("user-id").value = d.data._id;
    // Optionally, update any other parts of the UI with the selected node's data
    console.log("Selected node Name:", d.data.name);
    console.log("Selected node ID:", d.data._id);
    console.log("Selected node TYPE:", d.data.nodetype);
  }

});
//delete submit form
function submitDeleteForm() {
  document.getElementById("delete-form").submit();
}

