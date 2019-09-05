#!/usr/bin/env node

/**
 *
 * ARGUMENT PROCESSING
 *
 */
var oldJSON, newJSON, outputValue = undefined;
const program = require('commander');
program
  .arguments('<oldFRESH> <newFRESH> [output]')
  .action(function(oldFresh, newFresh, output) {
    if ((typeof(oldFresh) == 'undefined') || (typeof(newFresh) == 'undefined')) {
      console.log('Need 2 documents to create diff');
      process.exit(1);
    }
    oldJSON = require(`../${oldFresh}`);
    newJSON = require(`../${newFresh}`);
    outputValue = output ? output : './out/linkedin-changes.html';
  })
  .version('0.0.1');
program.parse(process.argv);

/**
 *
 * GENERATE DIFF & CHANGE OBJECT
 *
 */
const jsonDiff = require('json-diff');
const diff = jsonDiff.diff(oldJSON, newJSON);

const addSuffix = '__added';
const removeSuffix = '__deleted';

const changes = {
  about: {
    additions: [],
    changes: [],
    removals: [],
  },
  experience: {
    additions: [],
    changes: [],
    removals: [],
  },
  education_certification_courses: {
    additions: [],
    changes: [],
    removals: [],
  },
  volunteer: {
    additions: [],
    changes: [],
    removals: [],
  },
  skills: {
    additions: [],
    changes: [],
    removals: [],
  },
  publications: {
    additions: [],
    changes: [],
    removals: [],
  },
  projects: {
    additions: [],
    changes: [],
    removals: [],
  },
  honours: {
    additions: [],
    changes: [],
    removals: [],
  },
  language: {
    additions: [],
    changes: [],
    removals: [],
  },
  organisations: {
    additions: [],
    changes: [],
    removals: [],
  },
};

const printChanges = (object, v3Object, sectionKey, keys) => {
  if (!(typeof(object) == 'undefined')) {
    const addKeys = keys.map(a => `${a}${addSuffix}`);
    const removeKeys = keys.map(a => `${a}${removeSuffix}`);
    const added = Object.keys(object).filter(key => addKeys.includes(key));
    const changed = Object.keys(object).filter(key => keys.includes(key));
    const removed = Object.keys(object).filter(key => removeKeys.includes(key));
    const changeObject = {};
    const addObject = {};
    const deleteObject = {};
    ['title', 'role', 'position'].map(key => {
      if (!(typeof(v3Object[key]) == 'undefined')) {
        addObject[`original_${key}`] = v3Object[key];
        changeObject[`original_${key}`] = v3Object[key];
        deleteObject[`original_${key}`] = v3Object[key];
      }
    });

    if (added.length > 0) {
      const needsAdding = Object.keys(object).map(key => {
        if (addKeys.includes(key)) {
          const properKey = key.replace(addSuffix, '');
          addObject[properKey] = v3Object[properKey];
        }
        return key;
      }).filter(key => addKeys.includes(key));
      if (needsAdding.length) {
        changes[sectionKey].additions.push(addObject);
      }
    }
    if (changed.length > 0) {
      const needsAdding = Object.keys(object).map(key => {
        if (keys.includes(key)) {
          changeObject[key] = v3Object[key];
        }
        return key;
      }).filter(key => keys.includes(key));
      if (needsAdding.length) {
        changes[sectionKey].changes.push(changeObject);
      }
    }
    if (removed.length > 0) {
      const needsAdding = Object.keys(object).map(key => {
        if (removeKeys.includes(key)) {
          const properKey = key.replace(removeSuffix, '');
          deleteObject[properKey] = object[key];
        }
        return key;
      }).filter(key => removeKeys.includes(key));
      if (needsAdding.length) {
        changes[sectionKey].removals.push(deleteObject);
      }
    }
  }
};

const printArrayChanges = (section, itemKey, v3Section, sectionKey, keys) => {
  if (!(typeof(section) == 'undefined') && !(typeof(section[itemKey]) == 'undefined')) {
    section[itemKey].map((item, index) => {
      const isChange = item[0] === '~';
      const isNew = item[0] === '+';
      const isRemoved = item[0] === '-';
      const newItem = v3Section[itemKey][index];
      if (isNew) {
        const object = {};
        keys.map(key => object[key] = newItem[key]);
        changes[sectionKey].additions.push(object)
      }
      if (isChange) {
        printChanges(item[1], newItem, sectionKey, keys);
      }
      if (isRemoved) {
        const object = {};
        keys.map(key => object[key] = item[1][key]);
        changes[sectionKey].removals.push(object)
      }
    });
  }
};

if (!(typeof(diff) == 'undefined')){
  if (!(typeof(diff.info) == 'undefined') && !(typeof(diff.info.brief) == 'undefined')) {
    changes.about.changes.push({ body: diff.info.brief.__new })
  }

  const employmentKeys = ['position', 'employer', 'location', 'start', 'end', 'summary'];
  printArrayChanges(diff.employment, 'history', newJSON.employment, 'experience', employmentKeys);

  const educationKeys = ['institution', 'studyType', 'area', 'start', 'end', 'grade', 'highlights', 'summary', 'title', 'url', 'name'];
  printArrayChanges(diff.education, 'history', newJSON.education, 'education_certification_courses', educationKeys);

  const serviceKeys = ['organisation', 'position', 'category', 'start', 'end', 'summary', 'role'];
  printArrayChanges(diff.service, 'history', newJSON.service, 'volunteer', serviceKeys);

  const skillKeys = ['skills'];
  printArrayChanges(diff.skills, 'sets', newJSON.skills, 'skills', skillKeys);
}

const writingKeys = ['title', 'date', 'url', 'summary'];
printArrayChanges(diff, 'writing', newJSON, 'publications', writingKeys);

const projectKeys = ['title', 'start', 'end', 'url', 'description'];
printArrayChanges(diff, 'projects', newJSON, 'projects', projectKeys);

const recognitionKeys = ['title', 'from', 'date', 'summary'];
printArrayChanges(diff, 'recognition', newJSON, 'honours', recognitionKeys);

const languageKeys = ['language', 'level'];
printArrayChanges(diff, 'language', newJSON, 'language', languageKeys);

const governanceKeys = ['organisation', 'role', 'start', 'end', 'summary'];
printArrayChanges(diff, 'governance', newJSON, 'organisations', governanceKeys);

const affiliationKeys = ['organisation', 'role', 'start', 'end', 'summary'];
printArrayChanges(diff, 'affiliation', newJSON, 'organisations', affiliationKeys);

console.log('Changed properties');
console.log(JSON.stringify(changes, null, 4));

/**
 *
 * GENERATE THE CHANGES DOCUMENT
 *
 */
const Handlebars = require('handlebars');
const fs = require('fs');

// Create the HTML version
Handlebars.registerHelper("or",function() {
    var args = Array.prototype.slice.call(arguments);
    var options = args[args.length-1];

    for(var i=0; i<args.length-1; i++){
        if( args[i] && args[i].length > 0 ){
            return options.fn(this);
        }
    }
    return options.inverse(this);
});

fs.readFile('./templates/linkedin.hbs', function(err, data) {
  if(!err) {
    const template = data.toString();
    const compileTemplate = Handlebars.compile(template);
    const finalPageHTML = compileTemplate(changes);
    fs.writeFile(outputValue, finalPageHTML, function(err) {
      if (err) throw err;
    })
  } else {
    throw err;
  }
});
