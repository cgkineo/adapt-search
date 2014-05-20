describe('Adapt.Search()', function(){
    it('should return empty array when no search terms matched', function(){
        Adapt.Search('scotland');
        expect(Adapt.Search.results().length).to.equal(0);
    })
    
    it('should return no content matches when no space between search query words', function(){
        Adapt.Search('worldbrazil');
        expect(Adapt.Search.results().length).to.equal(0);
    })
    
    it('should return matches when multiple query words are matched', function(){
        Adapt.Search('italy,england');
        expect(Adapt.Search.results().length).to.be.above(0);
    })
    
    it('should return matches when the single query word is matched', function(){
        Adapt.Search('argentina');
        expect(Adapt.Search.results().length).to.be.above(0);
    })
    
    it('should return matches when at least one query word matched and there are others with no matches', function(){
        Adapt.Search('argentina scotland iceland');
        expect(Adapt.Search.results().length).to.be.above(0);
    })
    
    it('should not return more than the total number of blocks', function(){
        Adapt.Search('world cup brazil croatia spain argentina rio salvador germany italy england manaus mexico colombia uruguay belgium portugal france holland final');
        expect(Adapt.Search.results().length).to.not.be.above(Adapt.blocks.length);
    })
    
    it('should handle commas randomly placed within the search query', function(){
        Adapt.Search('brazil,spain, france , england ,world cup germany colombia');
        expect(Adapt.Search.results().length).to.be.above(0);
    })
    
    it('should handle a mixture of caps and lower case', function() {
        Adapt.Search('BraZil');
        expect(Adapt.Search.results().length).to.be.above(0);
    })
    
    it('should ignore any repeated keywords', function() {
        Adapt.Search('brazil spain brazil brazil');
        var firstSearchResults = Adapt.Search.results();
        Adapt.Search('brazil spain');
        expect(Adapt.Search.results()).to.eql(firstSearchResults);
    })
})